import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

// Handle POST (create tree)
export async function POST(req) {
  try {
    const formData = await req.formData();
    const treeId = formData.get('treeId');
    const date = formData.get('date');

    if (!treeId) {
      return NextResponse.json({ error: 'Missing tree ID' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    const treesCollection = db.collection('trees');

    const existingTree = await treesCollection.findOne({ id: treeId });

    if (existingTree) {
      return NextResponse.json({ ok: false, message: 'Tree already exists' });
    }

    await treesCollection.insertOne({
      id: treeId,
      createdAt: new Date(date),
    });

    return NextResponse.json({ ok: true, message: 'Tree inserted' });
  } catch (err) {
    console.error('Error creating tree:', err);
    return NextResponse.json({ error: 'Failed to create tree' }, { status: 500 });
  }
}

// Handle GET (check tree exists)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const treeId = searchParams.get('id');

  if (!treeId) {
    return NextResponse.json({ error: 'Missing tree ID' }, { status: 400 });
  }

  try {
    const db = (await clientPromise).db();
    const tree = await db.collection('trees').findOne({ id: treeId });

    return NextResponse.json({ exists: !!tree });
  } catch (err) {
    console.error('Error checking tree ID:', err);
    return NextResponse.json({ error: 'Failed to check tree' }, { status: 500 });
  }
}
