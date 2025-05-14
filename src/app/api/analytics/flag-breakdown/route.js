import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';


export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const { searchParams } = new URL(req.url);
    const treeId = searchParams.get('treeId');

    const pipeline = [
      ...(treeId ? [{ $match: { treeId } }] : []),
      { $unwind: '$flags' },
      {
        $group: {
          _id: '$flags',
          count: { $sum: 1 },
        },
      },
    ];

    const result = await db.collection('updates').aggregate(pipeline).toArray();

    const flagMap = {
      0: '🌴 Healthy',
      1: '🐛 Pests',
      2: '⚠️ Attention',
      3: '🌧️ Rain',
    };

    const summary = result.map((doc) => ({
      name: flagMap[doc._id] || `Flag ${doc._id}`,
      value: doc.count,
    }));

    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Failed to fetch flag breakdown', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
