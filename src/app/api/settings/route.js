import clientPromise from '@/lib/mongo';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = (await clientPromise).db();
    const settings = await db.collection('settings').find().toArray();
    
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    
    // Default fallback
    if (settingsMap.harvest_tracking_enabled === undefined) {
      settingsMap.harvest_tracking_enabled = false;
    }
    
    return NextResponse.json({ settings: settingsMap });
  } catch (err) {
    console.error('Failed to get settings:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { key, value } = await req.json();
    if (!key) {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }
    
    const db = (await clientPromise).db();
    await db.collection('settings').updateOne(
      { key },
      { $set: { key, value } },
      { upsert: true }
    );
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
