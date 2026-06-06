import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAdminDb } from '../../../../lib/adminDb';
import { getSession, clearCookieOptions } from '../../../../lib/auth';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const username = await getSession();
    if (!username) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { password } = await req.json();
    if (!password)     return NextResponse.json({ error: 'Password required' }, { status: 400 });

    const db      = getAdminDb();
    const userRef = db.collection('users').doc(username);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const match = await bcrypt.compare(password, userDoc.data().password);
    if (!match)  return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });

    // Delete all notes in the space subcollection first
    const notesSnap = await db.collection('spaces').doc(username).collection('notes').get();
    const batch = db.batch();
    notesSnap.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(db.collection('spaces').doc(username));
    batch.delete(userRef);
    await batch.commit();

    const res = NextResponse.json({ success: true });
    res.cookies.set(clearCookieOptions());
    return res;

  } catch (err) {
    console.error('[delete]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

