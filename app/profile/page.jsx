// app/profile/page.jsx
import { getSession } from '../../lib/auth';
import { getAdminDb } from '../../lib/adminDb';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const metadata = { title: 'Profile — Diary Dump' };

export default async function ProfilePage() {
  const username = await getSession();
  if (!username) redirect('/create');

  const db   = getAdminDb();
  const doc  = await db.collection('users').doc(username).get();
  const data = doc.data() || {};

  return (
    <ProfileClient
      username={username}
      displayName={data.displayName || username}
    />
  );
}
