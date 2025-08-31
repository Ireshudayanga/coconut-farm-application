// src/app/api/daily-update/route.js
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
    const fertilizers = JSON.parse(formData.get('fertilizers') || '[]');
    const image = formData.get('image');

    let imageUrl = null;

    if (image && typeof image === 'object') {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: 'tree-updates', upload_preset: 'treeFarm' },
            (error, result) => (error ? reject(error) : resolve(result))
          )
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    const db = (await clientPromise).db();
    await db.collection('updates').insertOne({
      treeId,
      watered,
      fertilizers,
      date,            // YYYY-MM-DD string as you already use
      imageUrl,
      createdAt: new Date(), // tie-breaker for same-day multiple updates
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
  }
}

// GET: List updates (optionally by treeId) with newest-first ordering
export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const { searchParams } = new URL(req.url);
    const treeId = searchParams.get('treeId');

    const query = treeId ? { treeId } : {};

    const updates = await db
      .collection('updates')
      .find(query)
      .sort({ date: -1, createdAt: -1 }) // 👈 newest day first, then newest time within that day
      .limit(100)
      .toArray();

    return NextResponse.json({
      updates: updates.map((u) => ({
        treeId: u.treeId,
        watered: u.watered,
        date: u.date,
        createdAt: u.createdAt,           // 👈 expose to client (for UI tie-break if needed)
        imageUrl: u.imageUrl || null,
        fertilizers: u.fertilizers || [],
      })),
    });
  } catch (err) {
    console.error('Fetch error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch updates' }, { status: 500 });
  }
}
