import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'crypto';

// ── Firebase Admin init (server-side, uses service account) ──────────────────
// We re-use the same Firebase project but via Admin SDK so rules don't block us.
// Set FIREBASE_SERVICE_ACCOUNT env var in Vercel as the full JSON string.
function getAdminDb() {
  if (!getApps().length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(sa) });
  }
  return getFirestore();
}

// Hash IP so we never store raw IPs — privacy-safe
function hashIp(ip) {
  return createHash('sha256').update(ip + 'diarydump_salt').digest('hex').slice(0, 32);
}

function getIp(req) {
  // Vercel sets x-forwarded-for automatically
  const forwarded = req.headers.get('x-forwarded-for');
  return (forwarded ? forwarded.split(',')[0] : '0.0.0.0').trim();
}

export async function POST(req) {
  try {
    const { noteId, emoji } = await req.json();

    if (!noteId || !emoji) {
      return NextResponse.json({ error: 'Missing noteId or emoji' }, { status: 400 });
    }

    // Map emoji → safe Firestore key
    const REACTION_KEYS = {
      '🕯️': 'candle', '🌹': 'rose', '💙': 'blue_heart',
      '🤍': 'white_heart', '🕊️': 'dove',
    };
    const reactionKey = REACTION_KEYS[emoji];
    if (!reactionKey) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
    }

    const db      = getAdminDb();
    const ipHash  = hashIp(getIp(req));
    const reactorRef = db
      .collection('notes').doc(noteId)
      .collection('reactors').doc(`${ipHash}_${reactionKey}`);

    // Check if already reacted
    const existing = await reactorRef.get();
    if (existing.exists) {
      return NextResponse.json({ alreadyReacted: true });
    }

    // Write reactor record + increment count atomically
    const noteRef = db.collection('notes').doc(noteId);
    const batch   = db.batch();
    batch.set(reactorRef, { reactedAt: FieldValue.serverTimestamp() });
    batch.update(noteRef, { [`reactions.${reactionKey}`]: FieldValue.increment(1) });
    await batch.commit();

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[api/react]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
