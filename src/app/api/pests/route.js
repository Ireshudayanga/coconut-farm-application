// src/app/api/pests/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongo';

// GET -> list pest names (sorted)
export async function GET() {
  try {
    const db = (await clientPromise).db();
    const docs = await db.collection('pests').find().sort({ name: 1 }).toArray();
    return NextResponse.json({ pests: docs.map((d) => d.name) });
  } catch (err) {
    console.error('GET pests error:', err);
    return NextResponse.json({ error: 'Failed to fetch pests' }, { status: 500 });
  }
}

// POST -> add pest (dedupe)
export async function POST(req) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Missing pest name' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    const existing = await db.collection('pests').findOne({ name });
    if (existing) {
      return NextResponse.json({ ok: false, message: 'Pest already exists' });
    }

    await db.collection('pests').insertOne({ name });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST pests error:', err);
    return NextResponse.json({ error: 'Failed to add pest' }, { status: 500 });
  }
}

// DELETE -> remove pest by exact name
export async function DELETE(req) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Missing pest name' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    const result = await db.collection('pests').deleteOne({ name });
    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, message: 'Pest not found' });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE pests error:', err);
    return NextResponse.json({ error: 'Failed to delete pest' }, { status: 500 });
  }
}
