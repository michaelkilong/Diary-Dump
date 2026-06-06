import { NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/adminDb';

const RESERVED = ['admin','settings','menu','create','login','api','pinned','public'];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get('u') || '').toLowerCase().trim();

  // Validate format
  if (!username || username.length < 3) {
    return NextResponse.json({ available: false, reason: 'Too short — min 3 characters' });
  }
  if (username.length > 24) {
    return NextResponse.json({ available: false, reason: 'Too long — max 24 characters' });
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'Letters, numbers and _ only' });
  }
  if (RESERVED.includes(username)) {
    return NextResponse.json({ available: false, reason: 'That name is reserved' });
  }

  const db  = getAdminDb();
  const doc = await db.collection('users').doc(username).get();

  if (doc.exists) {
    return NextResponse.json({ available: false, reason: 'Already taken' });
  }
  return NextResponse.json({ available: true });
}

