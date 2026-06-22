import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const { searchParams } = new URL(req.url);
    const treeId = searchParams.get('treeId');

    // 1. Basic Counts matching the treeId if provided
    const treeMatch = treeId ? { id: treeId } : {};
    const updateMatch = treeId ? { treeId } : {};
    const harvestMatch = treeId ? { treeId } : {};

    const totalTrees = await db.collection('trees').countDocuments(treeMatch);
    const totalUpdates = await db.collection('updates').countDocuments(updateMatch);

    // Sum harvests
    const harvestSumResult = await db.collection('harvests').aggregate([
      { $match: harvestMatch },
      { $group: { _id: null, total: { $sum: '$nutsCount' } } }
    ]).toArray();
    const totalHarvested = harvestSumResult[0]?.total || 0;

    // Calculate Average Coconuts per tree
    const averageYield = totalTrees > 0 ? Number((totalHarvested / totalTrees).toFixed(1)) : 0;

    // 2. Daily updates trend (last 30 days)
    const updatesPerDay = await db.collection('updates').aggregate([
      { $match: updateMatch },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]).toArray();

    // 3. Daily harvests trend (last 30 days)
    const harvestsPerDay = await db.collection('harvests').aggregate([
      { $match: harvestMatch },
      {
        $group: {
          _id: '$date',
          count: { $sum: '$nutsCount' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]).toArray();

    // 4. Watering Summary
    const wateringSummary = await db.collection('updates').aggregate([
      { $match: updateMatch },
      {
        $group: {
          _id: '$watered',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // 5. Fertilizer breakdown
    const fertilizerBreakdown = await db.collection('updates').aggregate([
      { $match: updateMatch },
      { $unwind: '$fertilizers' },
      {
        $group: {
          _id: '$fertilizers',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // 6. Pest breakdown
    const pestBreakdown = await db.collection('updates').aggregate([
      {
        $match: {
          ...updateMatch,
          pestNotes: { $ne: '' }
        }
      },
      {
        $group: {
          _id: '$pestNotes',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    return NextResponse.json({
      ok: true,
      summary: {
        totalTrees,
        totalUpdates,
        totalHarvested,
        averageYield
      },
      updatesPerDay: updatesPerDay.map(d => ({ date: d._id, count: d.count })),
      harvestsPerDay: harvestsPerDay.map(d => ({ date: d._id, count: d.count })),
      wateringSummary: wateringSummary.map(d => ({
        name: d._id === true || d._id === 'true' ? 'Watered' : 'Not Watered',
        value: d.count
      })),
      fertilizerBreakdown: fertilizerBreakdown.map(d => ({ name: d._id, count: d.count })),
      pestBreakdown: pestBreakdown.map(d => ({ name: d._id, count: d.count })),
    });

  } catch (err) {
    console.error('Failed to generate dashboard analytics:', err);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
