// app/api/view/route.js
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getAdminDb, FieldValue } from '../../../lib/adminDb.js';

function hashIp(ip) {
  return createHash('sha256').update(ip + 'diarydump_salt').digest('hex').slice(0, 32);
}
function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '0.0.0.0').trim();
}

export async function POST(req) {
  try {
    const { noteId } = await req.json();
    if (!noteId) return NextResponse.json({ error: 'Missing noteId' }, { status: 400 });

    const db        = getAdminDb();
    const ipHash    = hashIp(getIp(req));
    const viewerRef = db.collection('notes').doc(noteId).collection('viewers').doc(ipHash);
    if ((await viewerRef.get()).exists) {
      const snap = await db.collection('notes').doc(noteId).get();
      return NextResponse.json({ alreadyViewed: true, views: snap.data()?.views ?? 0 });
    }

    const noteRef = db.collection('notes').doc(noteId);
    const batch   = db.batch();
    batch.set(viewerRef, { viewedAt: FieldValue.serverTimestamp() });
    batch.update(noteRef, { views: FieldValue.increment(1) });
    await batch.commit();

    const updated = await noteRef.get();
    return NextResponse.json({ success: true, views: updated.data()?.views ?? 1 });
  } catch (err) {
    console.error('[view]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
