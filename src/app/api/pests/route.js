// src/app/api/pests/route.js
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongo';

/**
 * Collection schema (simple):
 * db.pests.insertOne({ name: "Rhinoceros beetle" })
 * db.pests.insertOne({ name: "Red palm weevil" })
 */
export async function GET() {
  try {
    const db = (await clientPromise).db();
    const pests = await db.collection('pests').find().sort({ name: 1 }).toArray();
    return NextResponse.json({ pests: pests.map((p) => p.name) });
  } catch (err) {
    console.error('GET pests error:', err);
    return NextResponse.json({ error: 'Failed to fetch pests' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();
    const trimmed = name?.trim();
    if (!trimmed) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const db = (await clientPromise).db();
    const existing = await db.collection('pests').findOne({ name: trimmed });
    if (existing) return NextResponse.json({ ok: false, message: 'Already exists' });

    await db.collection('pests').insertOne({ name: trimmed });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST pests error:', err);
    return NextResponse.json({ error: 'Failed to add pest' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { name } = await req.json();
    const trimmed = name?.trim();
    if (!trimmed) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const db = (await clientPromise).db();
    const result = await db.collection('pests').deleteOne({ name: trimmed });
    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, message: 'Not found' });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE pests error:', err);
    return NextResponse.json({ error: 'Failed to delete pest' }, { status: 500 });
  }
}
