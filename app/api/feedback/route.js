// app/api/feedback/route.js
import { NextResponse } from 'next/server';
import { getAdminDb, FieldValue } from '../../../lib/adminDb.js';
import { getSession } from '../../../lib/auth.js';

export async function POST(req) {
  try {
    const { type, message } = await req.json();
    if (!type || !message?.trim())
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (!['feedback', 'complaint'].includes(type))
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    if (message.length > 2000)
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });

    const session = await getSession();
    const db = getAdminDb();
    await db.collection('feedback').add({
      type,
      message: message.trim(),
      from: session || 'anonymous',
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[feedback]', err);
    return NextResponse.json({ error: 'Server error: ' + err.message }, { status: 500 });
  }
}
