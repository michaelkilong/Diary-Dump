import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';

function getAdminDb() {
  if (!getApps().length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(sa) });
  }
  return getFirestore();
}

function hashIp(ip) {
  return createHash('sha256').update(ip + 'diarydump_salt').digest('hex').slice(0, 32);
}

function getIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0] : '0.0.0.0').trim();
}

export async function POST(req) {
  try {
    const { noteId } = await req.json();
    if (!noteId) {
      return NextResponse.json({ error: 'Missing noteId' }, { status: 400 });
    }

    const db       = getAdminDb();
    const ipHash   = hashIp(getIp(req));
    const viewerRef = db
      .collection('notes').doc(noteId)
      .collection('viewers').doc(ipHash);

    const existing = await viewerRef.get();
    if (existing.exists) {
      // Already viewed — return current count without incrementing
      const noteSnap = await db.collection('notes').doc(noteId).get();
      return NextResponse.json({ alreadyViewed: true, views: noteSnap.data()?.views ?? 0 });
    }

    // New viewer — increment
    const noteRef = db.collection('notes').doc(noteId);
    const batch   = db.batch();
    batch.set(viewerRef, { viewedAt: FieldValue.serverTimestamp() });
    batch.update(noteRef, { views: FieldValue.increment(1) });
    await batch.commit();

    const updated = await noteRef.get();
    return NextResponse.json({ success: true, views: updated.data()?.views ?? 1 });

  } catch (err) {
    console.error('[api/view]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
