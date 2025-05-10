import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = (await clientPromise).db();
    const farmers = await db.collection('farmers').find().sort({ name: 1 }).toArray();

    return NextResponse.json({
      farmers: farmers.map((f) => ({
        id: f._id.toString(),
        name: f.name,
        username: f.username,
      })),
    });
  } catch (err) {
    console.error('GET farmers error:', err);
    return NextResponse.json({ error: 'Failed to fetch farmers' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, username, password } = await req.json();
    if (!name || !username || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    const exists = await db.collection('farmers').findOne({ username });

    if (exists) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.collection('farmers').insertOne({ name, username, passwordHash });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST farmer error:', err);
    return NextResponse.json({ error: 'Failed to add farmer' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const db = (await clientPromise).db();
    await db.collection('farmers').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE farmer error:', err);
    return NextResponse.json({ error: 'Failed to delete farmer' }, { status: 500 });
  }
}
