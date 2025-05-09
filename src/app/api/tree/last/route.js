import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = (await clientPromise).db();
    const treesCollection = db.collection('trees');

    // Get tree with the highest numeric ID
    const lastTree = await treesCollection
      .find({ id: { $regex: /^TREE-\d+$/ } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();

    if (lastTree.length > 0) {
      const lastId = lastTree[0].id;
      const number = parseInt(lastId.split('-')[1], 10);
      return NextResponse.json({ lastNumber: number });
    }

    return NextResponse.json({ lastNumber: 0 }); // no trees yet
  } catch (err) {
    console.error('Error fetching last tree ID:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
