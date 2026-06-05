// app/api/react/route.js
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getAdminDb, FieldValue } from '../../../lib/adminDb.js';

const REACTION_KEYS = {
  '\u{1F56F}\uFE0F': 'candle',
  '\u{1F339}': 'rose',
  '\u{1F499}': 'blue_heart',
  '\u{1F90D}': 'white_heart',
  '\u{1F54A}\uFE0F': 'dove',
};

function hashIp(ip) {
  return createHash('sha256').update(ip + 'diarydump_salt').digest('hex').slice(0, 32);
}
function getIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd ? fwd.split(',')[0] : '0.0.0.0').trim();
}

export async function POST(req) {
  try {
    const { noteId, emoji } = await req.json();
    if (!noteId || !emoji) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const reactionKey = REACTION_KEYS[emoji];
    if (!reactionKey) return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });

    const db         = getAdminDb();
    const ipHash     = hashIp(getIp(req));
    const reactorRef = db.collection('notes').doc(noteId).collection('reactors').doc(`${ipHash}_${reactionKey}`);
    if ((await reactorRef.get()).exists) return NextResponse.json({ alreadyReacted: true });

    const batch = db.batch();
    batch.set(reactorRef, { reactedAt: FieldValue.serverTimestamp() });
    batch.update(db.collection('notes').doc(noteId), {
      [`reactions.${reactionKey}`]: FieldValue.increment(1),
    });
    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[react]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
