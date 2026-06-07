// app/api/profile/route.js
import { NextResponse } from 'next/server';
import { getAdminDb, FieldValue } from '../../../lib/adminDb.js';
import { getSession } from '../../../lib/auth.js';

export async function POST(req) {
  try {
    const username = await getSession();
    if (!username) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { displayName } = await req.json();
    const name = (displayName || '').trim();
    if (!name || name.length > 40)
      return NextResponse.json({ error: 'Display name must be 1–40 characters' }, { status: 400 });

    const db = getAdminDb();
    const batch = db.batch();
    batch.update(db.collection('users').doc(username),  { displayName: name });
    batch.update(db.collection('spaces').doc(username), { displayName: name });
    await batch.commit();
    return NextResponse.json({ success: true, displayName: name });
  } catch (err) {
    console.error('[profile]', err);
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}
