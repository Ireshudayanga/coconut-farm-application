import clientPromise from '@/lib/mongo';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { completed } = await req.json();

    const db = (await clientPromise).db();
    
    const updateDoc = {
      $set: {
        completed: !!completed,
        completedAt: completed ? new Date() : null,
      },
    };

    const result = await db
      .collection('tasks')
      .updateOne({ _id: new ObjectId(id) }, updateDoc);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update task:', err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const db = (await clientPromise).db();
    const result = await db
      .collection('tasks')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete task:', err);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
