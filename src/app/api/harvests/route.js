import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const { searchParams } = new URL(req.url);
    const leaderboardOnly = searchParams.get('leaderboard') === 'true';

    // Aggregate total yield per tree
    const pipeline = [
      {
        $group: {
          _id: '$treeId',
          totalNuts: { $sum: '$nutsCount' },
        },
      },
      { $sort: { totalNuts: -1 } },
      { $limit: 15 } // Top 15 trees
    ];
    const leaderboard = await db.collection('harvests').aggregate(pipeline).toArray();

    if (leaderboardOnly) {
      return NextResponse.json({ leaderboard });
    }

    const harvests = await db
      .collection('harvests')
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ harvests, leaderboard });
  } catch (err) {
    console.error('Failed to fetch harvests:', err);
    return NextResponse.json({ error: 'Failed to fetch harvests' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { treeId, nutsCount, date, farmerId, createdAt } = await req.json();

    if (!treeId || nutsCount === undefined || !date) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = (await clientPromise).db();

    // Verify if tree exists
    const tree = await db.collection('trees').findOne({ id: treeId });
    if (!tree) {
      return NextResponse.json({ error: 'Tree does not exist' }, { status: 404 });
    }

    await db.collection('harvests').insertOne({
      treeId,
      nutsCount: Number(nutsCount),
      date,
      farmerId: farmerId || 'unknown',
      createdAt: createdAt ? new Date(createdAt) : new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to create harvest:', err);
    return NextResponse.json({ error: 'Failed to create harvest' }, { status: 500 });
  }
}
