// app/api/space/note/route.js
import { NextResponse } from 'next/server';
import { getAdminDb, FieldValue } from '../../../../lib/adminDb.js';
import { getSession } from '../../../../lib/auth.js';

export async function POST(req) {
  try {
    const { spaceOwner, name, message, forWho, colorKey, x, y, rotation } = await req.json();
    if (!spaceOwner || !name?.trim() || !message?.trim())
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    if (message.length > 500 || name.length > 50)
      return NextResponse.json({ error: 'Content too long' }, { status: 400 });

    const db        = getAdminDb();
    const spaceSnap = await db.collection('spaces').doc(spaceOwner).get();
    if (!spaceSnap.exists) return NextResponse.json({ error: 'Space not found' }, { status: 404 });

    const session  = await getSession();
    const postedBy = session === spaceOwner ? spaceOwner : 'visitor';

    await db.collection('spaces').doc(spaceOwner).collection('notes').add({
      name: name.trim(), message: message.trim(),
      for: forWho?.trim() || '',
      colorKey: colorKey || 'cream',
      x: x ?? 2000, y: y ?? 2000,
      rotation: rotation ?? (Math.random() - 0.5) * 5,
      postedBy, reactions: {}, views: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[space/note]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
