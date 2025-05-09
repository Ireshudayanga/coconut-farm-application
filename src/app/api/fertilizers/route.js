import { NextResponse } from 'next/server';

export async function GET() {
  // Static for now, replace with MongoDB fetch if needed
  const fertilizers = ['Urea', 'Compost', 'NPK', 'Organic Mix'];

  return NextResponse.json({ fertilizers });
}
