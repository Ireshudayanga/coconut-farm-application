// src/app/api/tree/all/route.js
import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = (await clientPromise).db();
    const trees = await db.collection('trees').find().sort({ id: 1 }).toArray();

    return NextResponse.json({
      trees: trees.map((t) => ({ id: t.id })),
    });
  } catch (err) {
    console.error('❌ Failed to fetch trees:', err);
    return NextResponse.json({ error: 'Failed to fetch trees' }, { status: 500 });
  }
}
