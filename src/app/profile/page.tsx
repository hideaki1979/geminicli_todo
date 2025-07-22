import type { Metadata } from "next";
import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import Profile from '@/components/Profile';

export const metadata: Metadata = {
  title: 'プロフィール',
};

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <Profile session={session} />;
};

export default ProfilePage;