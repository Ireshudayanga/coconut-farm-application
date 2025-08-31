// src/app/api/backup/month/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import clientPromise from '@/lib/mongo';

// Helper: turn "YYYY-MM" into [startDate, endDate] (Date objects)
function monthBounds(yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) throw new Error('Invalid month format');
  const [y, m] = yyyyMm.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1, 0, 0, 0));
  return { start, end };
}

export async function GET(req) {
  try {
    // 1) Very simple "auth" like the rest of the app:
    // owner-login sets `owner_token=valid` cookie; we reuse it here.
    const ownerCookie = cookies().get('owner_token')?.value;
    if (ownerCookie !== 'valid') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2) Parse the month
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // expected "YYYY-MM"
    if (!month) return NextResponse.json({ error: 'Missing ?month=YYYY-MM' }, { status: 400 });

    const { start, end } = monthBounds(month);

    const db = (await clientPromise).db();

    // 3) Collect data:
    // updates: your schema stores `date` as "YYYY-MM-DD" *string*, plus createdAt (Date).
    // Filtering by month using the string is easy: date >= "YYYY-MM-01" and < next month's "YYYY-MM-01".
    const yyyy = month.slice(0, 4);
    const mm = month.slice(5, 7);
    const startStr = `${yyyy}-${mm}-01`;
    // next month string:
    const nextMonth = new Date(Date.UTC(Number(yyyy), Number(mm) - 1 + 1, 1));
    const nextY = nextMonth.getUTCFullYear();
    const nextM = String(nextMonth.getUTCMonth() + 1).padStart(2, '0');
    const endStr = `${nextY}-${nextM}-01`;

    const updates = await db
      .collection('updates')
      .find({ date: { $gte: startStr, $lt: endStr } })
      .sort({ date: 1, createdAt: 1 })
      .toArray();

    // trees: by createdAt Date inside month
    const trees = await db
      .collection('trees')
      .find({ createdAt: { $gte: start, $lt: end } })
      .sort({ createdAt: 1 })
      .toArray();

    // these don’t have a month field; include full lists so the backup is useful
    const farmers = await db.collection('farmers').find().sort({ name: 1 }).toArray();
    const fertilizers = await db.collection('fertilizers').find().sort({ name: 1 }).toArray();
    const pests = await db.collection('pests').find().sort({ name: 1 }).toArray();

    // 4) Make docs JSON-safe (_id -> string)
    const normalize = (arr) =>
      arr.map((d) => {
        const o = { ...d };
        if (o._id) o._id = o._id.toString();
        return o;
      });

    const payload = {
      meta: {
        month,
        generatedAt: new Date().toISOString(),
        note:
          'This file contains updates for the selected month, trees created in that month, and full lists of farmers/fertilizers/pests.',
      },
      updates: normalize(updates),
      trees: normalize(trees),
      farmers: normalize(farmers),
      fertilizers: normalize(fertilizers),
      pests: normalize(pests),
    };

    // 5) Stream as a downloadable file
    return new NextResponse(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="backup-${month}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Monthly backup error:', err);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}
