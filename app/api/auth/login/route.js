import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminDb } from '../../../../lib/adminDb';
import { signToken, cookieOptions } from '../../../../lib/auth';

export async function POST(req) {
  try {
    const { username: raw, password } = await req.json();
    const username = (raw || '').toLowerCase().trim();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const db  = getAdminDb();
    const doc = await db.collection('users').doc(username).get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const match = await bcrypt.compare(password, doc.data().password);
    if (!match) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await signToken(username);
    const res   = NextResponse.json({ success: true, username });
    res.cookies.set(cookieOptions(token));
    return res;

  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}

