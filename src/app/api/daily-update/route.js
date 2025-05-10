import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import clientPromise from '@/lib/mongo';

// POST: Save a daily update
export async function POST(req) {
  try {
    const formData = await req.formData();

    const treeId = formData.get('treeId');
    const watered = formData.get('watered') === 'true';
    const date = formData.get('date');
    const pestNotes = formData.get('pestNotes') || '';
    const notes = formData.get('notes') || '';
    const fertilizers = JSON.parse(formData.get('fertilizers') || '[]');
    const flags = JSON.parse(formData.get('flags') || '[]');
    const image = formData.get('image');

    let imageUrl = null;

    if (image && typeof image === 'object') {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'tree-updates',
            upload_preset: 'treeFarm',
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
      fertilizers,
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

export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const { searchParams } = new URL(req.url);
    const treeId = searchParams.get('treeId');

    const query = treeId ? { treeId } : {}; // ✅ filter if provided

    const updates = await db.collection('updates')
      .find(query)
      .sort({ date: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      updates: updates.map((u) => ({
        treeId: u.treeId,
        watered: u.watered,
        date: u.date,
        flags: u.flags || [],
        notes: u.notes || '',
        imageUrl: u.imageUrl || null,
        fertilizers: u.fertilizers || [],
      })),
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch updates' }, { status: 500 });
  }
}

