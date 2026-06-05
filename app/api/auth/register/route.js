// app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcryptjs');
import { getAdminDb, FieldValue } from '../../../../lib/adminDb.js';
import { signToken, cookieOptions } from '../../../../lib/auth.js';

const RESERVED = ['admin','settings','menu','create','login','api','pinned','public'];

export async function POST(req) {
  try {
    const { username: raw, password } = await req.json();
    const username = (raw || '').toLowerCase().trim();
    if (!username || username.length < 3 || username.length > 24)
      return NextResponse.json({ error: 'Username must be 3–24 characters' }, { status: 400 });
    if (!/^[a-z0-9_]+$/.test(username))
      return NextResponse.json({ error: 'Letters, numbers and _ only' }, { status: 400 });
    if (RESERVED.includes(username))
      return NextResponse.json({ error: 'That username is reserved' }, { status: 400 });
    if (!password || password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

    const db = getAdminDb();
    const userRef = db.collection('users').doc(username);
    if ((await userRef.get()).exists)
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });

    const hash = await bcrypt.hash(password, 12);
    const batch = db.batch();
    batch.set(userRef, { password: hash, createdAt: FieldValue.serverTimestamp() });
    batch.set(db.collection('spaces').doc(username), { owner: username, createdAt: FieldValue.serverTimestamp() });
    await batch.commit();

    const token = await signToken(username);
    const res = NextResponse.json({ success: true, username });
    res.cookies.set(cookieOptions(token));
    return res;
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

