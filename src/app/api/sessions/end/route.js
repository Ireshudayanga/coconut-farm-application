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
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('coconut_farm');

    await db.collection('sessions').updateOne(
      { sessionId },
      { $set: { endTime: new Date(), lastActive: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Session end error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
