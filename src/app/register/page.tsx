'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import EmojiBackground from '../../components/EmojiBackground';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Pendaftaran berhasil! Silakan periksa inbox email kamu untuk verifikasi akun sebelum login.',
      });
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <EmojiBackground />

      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Svvagy Finance</h1>
          <p className="mt-2 text-sm text-zinc-400">Manage Keuanganmu Dengan Sangat Mudah!</p>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg p-3 text-sm font-medium ${
              message.type === 'error'
                ? 'border border-red-500/50 bg-red-500/10 text-red-400'
                : 'border border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Daftar Akun'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-400 hover:underline">
            Masuk disini
          </Link>
        </p>
      </div>
    </main>
  );
}