import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = (await clientPromise).db();

    const pipeline = [
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ];

    const result = await db.collection('updates').aggregate(pipeline).toArray();

    const updates = result.map((doc) => ({
      date: doc._id,
      count: doc.count,
    }));

    return NextResponse.json({ updates });
  } catch (err) {
    console.error('Failed to fetch updates per day', err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
