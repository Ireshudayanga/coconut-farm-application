import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const db = (await clientPromise).db();
    const tasks = await db
      .collection('tasks')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('Failed to get tasks:', err);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { treeIds, description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Missing description' }, { status: 400 });
    }

    const db = (await clientPromise).db();

    // If no trees are selected, insert a single general task
    if (!treeIds || !Array.isArray(treeIds) || treeIds.length === 0) {
      const newTask = {
        treeId: "",
        description,
        completed: false,
        createdAt: new Date(),
        completedAt: null,
      };
      await db.collection('tasks').insertOne(newTask);
      return NextResponse.json({ ok: true });
    }

    // Verify all selected tree IDs exist
    for (const treeId of treeIds) {
      const tree = await db.collection('trees').findOne({ id: treeId });
      if (!tree) {
        return NextResponse.json({ error: `Tree ${treeId} does not exist` }, { status: 404 });
      }
    }

    // Insert task for each selected tree
    const tasksToInsert = treeIds.map((treeId) => ({
      treeId,
      description,
      completed: false,
      createdAt: new Date(),
      completedAt: null,
    }));

    await db.collection('tasks').insertMany(tasksToInsert);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to create task:', err);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
