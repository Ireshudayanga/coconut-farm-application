// src/app/api/owner-login/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  const valid = password === process.env.OWNER_PASSWORD;
  return NextResponse.json({ ok: valid });
}
