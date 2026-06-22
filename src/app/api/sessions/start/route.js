import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongo';

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const { sessionId, username } = body;

    if (!sessionId || !username) {
      return NextResponse.json({ error: 'Missing sessionId or username' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coconut_farm');

    const now = new Date();
    await db.collection('sessions').insertOne({
      sessionId,
      username,
      startTime: now,
      endTime: null,
      lastActive: now,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Session start error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
