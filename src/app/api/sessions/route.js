import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongo';

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db('coconut_farm');

    const sessions = await db.collection('sessions')
      .find({})
      .sort({ startTime: -1 })
      .toArray();

    // Process sessions to calculate duration and determine status
    const processedSessions = sessions.map(session => {
      const start = new Date(session.startTime);
      const endOrLastActive = session.endTime ? new Date(session.endTime) : new Date(session.lastActive);

      // Calculate duration in minutes
      const diffMs = endOrLastActive - start;
      const durationMinutes = Math.max(0, Math.floor(diffMs / 60000));

      // Determine if session is considered "Online" right now
      // Since heartbeats happen every 1 minute, if we haven't seen them for 3 minutes, they are offline.
      const now = new Date();
      const lastActiveMs = new Date(session.lastActive).getTime();
      const minutesSinceLastActive = (now.getTime() - lastActiveMs) / 60000;

      const isOnline = !session.endTime && minutesSinceLastActive < 3;

      return {
        _id: session._id.toString(),
        sessionId: session.sessionId,
        username: session.username,
        startTime: session.startTime,
        endTime: session.endTime || null,
        lastActive: session.lastActive,
        durationMinutes,
        isOnline
      };
    });

    return NextResponse.json({ ok: true, sessions: processedSessions });
  } catch (err) {
    console.error('Failed to fetch sessions:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
