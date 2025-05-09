import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongo';

export async function GET() {
  try {
    const db = (await clientPromise).db();
    const fertilizers = await db.collection('fertilizers').find().toArray();
    const names = fertilizers.map((f) => f.name);
    return NextResponse.json({ fertilizers: names });
  } catch (err) {
    console.error('Error fetching fertilizers:', err);
    return NextResponse.json({ error: 'Failed to fetch fertilizers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Missing fertilizer name' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    const existing = await db.collection('fertilizers').findOne({ name });

    if (existing) {
      return NextResponse.json({ ok: false, message: 'Fertilizer already exists' });
    }

    await db.collection('fertilizers').insertOne({ name });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error adding fertilizer:', err);
    return NextResponse.json({ error: 'Failed to add fertilizer' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Missing fertilizer name' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    const result = await db.collection('fertilizers').deleteOne({ name });

    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, message: 'Fertilizer not found' });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Error deleting fertilizer:', err);
    return NextResponse.json({ error: 'Failed to delete fertilizer' }, { status: 500 });
  }
}
