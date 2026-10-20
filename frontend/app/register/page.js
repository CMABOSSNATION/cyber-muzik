'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProfileForm from '../../components/ProfileForm';
import { api } from '../../lib/api';
import { saveSession } from '../../lib/session';

export default function RegisterPage() {
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: { username: form.username, email: form.email, password: form.password },
      });
      saveSession(data.token, data.artist);
      setAccount({ token: data.token, artist: data.artist });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (account) {
    return (
      <div className="page max-w-md">
        <h1 className="text-2xl font-bold text-white">Set up your profile</h1>
        <p className="mb-6 mt-1 text-sm text-zinc-400">Your account is ready. Add a photo and a short bio, or skip for now.</p>
        <ProfileForm
          artist={account.artist}
          token={account.token}
          submitLabel="Save and continue"
          onSaved={() => router.push('/upload')}
          onSkip={() => router.push('/upload')}
        />
      </div>
    );
  }

  return (
    <div className="page max-w-md">
      <h1 className="text-2xl font-bold text-white">Create an artist account</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">Upload your music and reach new listeners.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="username">Artist name</label>
          <input id="username" className="input" autoComplete="nickname" value={form.username} onChange={set('username')} required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" className="input" minLength={8} value={form.password} onChange={set('password')} required />
          <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
        </div>
        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" autoComplete="new-password" className="input" value={form.confirm} onChange={set('confirm')} required />
        </div>
        {error && <p className="notice-error">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
