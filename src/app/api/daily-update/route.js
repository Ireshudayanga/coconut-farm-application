import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import clientPromise from '@/lib/mongo';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const treeId = formData.get('treeId');
    const watered = formData.get('watered') === 'true';
    const date = formData.get('date');
    const pestNotes = formData.get('pestNotes') || '';
    const notes = formData.get('notes') || '';
    const flags = JSON.parse(formData.get('flags') || '[]');
    const image = formData.get('image');

    let imageUrl = null;

    if (image && typeof image === 'object') {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'tree-updates',           // optional folder in Cloudinary
            upload_preset: 'treeFarm',        // ✅ your preset name
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const db = (await clientPromise).db();
    await db.collection('updates').insertOne({
      treeId,
      watered,
      date,
      pestNotes,
      notes,
      flags,
      imageUrl,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
  }
}
