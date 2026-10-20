'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '../../../components/ProfileForm';
import { useSession } from '../../../lib/session';

export default function EditProfilePage() {
  const router = useRouter();
  const { ready, token, artist } = useSession();

  useEffect(() => {
    if (ready && !token) router.replace('/login');
  }, [ready, token, router]);

  if (!ready || !artist) return <div className="page"><p className="py-10 text-center text-sm text-zinc-500">Loading...</p></div>;

  return (
    <div className="page max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit profile</h1>
      <ProfileForm artist={artist} token={token} submitLabel="Save changes" onSaved={() => router.push('/artist/dashboard')} onSkip={() => router.push('/artist/dashboard')} />
    </div>
  );
}
