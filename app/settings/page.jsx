import { getSession } from '../../lib/auth';
import { redirect }   from 'next/navigation';
import SettingsClient from './SettingsClient';

export const metadata = { title: 'Settings — Diary Dump' };

export default async function SettingsPage() {
  const user = await getSession();
  if (!user) redirect('/create');
  return <SettingsClient username={user} />;
}
