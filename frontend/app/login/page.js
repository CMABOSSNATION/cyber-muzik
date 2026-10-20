'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { saveSession } from '../../lib/session';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      saveSession(data.token, data.artist);
      router.push('/artist/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="page max-w-md">
      <h1 className="text-2xl font-bold text-white">Sign in</h1>
      <p className="mb-6 mt-1 text-sm text-zinc-400">Sign in to upload music and manage your profile.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="notice-error">{error}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        New here?{' '}
        <Link href="/register" className="font-medium text-brand hover:underline">
          Create an artist account
        </Link>
      </p>
    </div>
  );
}
