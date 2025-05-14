
import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const { searchParams } = new URL(req.url);
    const treeId = searchParams.get('treeId');

    const pipeline = [
      ...(treeId ? [{ $match: { treeId } }] : []),
      {
        $group: {
          _id: '$watered',
          count: { $sum: 1 },
        },
      },
    ];

    const result = await db.collection('updates').aggregate(pipeline).toArray();

    const summary = result.map((doc) => ({
      name: doc._id ? 'Watered' : 'Not Watered',
      value: doc.count,
    }));

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Failed to fetch watering summary', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
