import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { password, hash } = await req.json();
    const valid = await bcrypt.compare(password, hash);
    return NextResponse.json({ ok: valid });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
