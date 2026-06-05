// app/api/auth/check/route.js
import { NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/adminDb.js';

const RESERVED = ['admin','settings','menu','create','login','api','pinned','public'];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || '').toLowerCase().trim();
  if (!username || username.length < 3)
    return NextResponse.json({ available: false, reason: 'Too short — min 3 characters' });
  if (username.length > 24)
    return NextResponse.json({ available: false, reason: 'Too long — max 24 characters' });
  if (!/^[a-z0-9_]+$/.test(username))
    return NextResponse.json({ available: false, reason: 'Letters, numbers and _ only' });
  if (RESERVED.includes(username))
    return NextResponse.json({ available: false, reason: 'That name is reserved' });

  const db  = getAdminDb();
  const doc = await db.collection('users').doc(username).get();
  return NextResponse.json(doc.exists
    ? { available: false, reason: 'Already taken' }
    : { available: true });
}
