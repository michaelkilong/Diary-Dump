import { getAdminDb } from '../../../lib/adminDb';
import { getSession }  from '../../../lib/auth';
import { notFound }    from 'next/navigation';
import SpaceWall       from './SpaceWall';

export async function generateMetadata({ params }) {
  return { title: `${params.username}'s Space — Diary Dump` };
}

export default async function SpacePage({ params }) {
  const { username } = params;
  const db    = getAdminDb();
  const space = await db.collection('spaces').doc(username).get();
  if (!space.exists) notFound();

  const currentUser = await getSession();

  return (
    <SpaceWall
      spaceOwner={username}
      currentUser={currentUser}
      isOwner={currentUser === username}
    />
  );
}
