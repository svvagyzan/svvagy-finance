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

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-widest text-white uppercase sm:text-5xl">
          Svvagy Finance
        </h1>
        <p className="mt-2.5 text-xs font-extrabold tracking-widest text-zinc-400 uppercase sm:text-sm">
          Manage Keuanganmu Dengan Sangat Mudah!
        </p>
      </div>

      <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-md">
        {message && (
          <div
            className={`mb-6 border p-3.5 text-xs font-bold uppercase tracking-wider text-center ${
              message.type === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6" autoComplete="off">
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="mt-2 w-full border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-zinc-700 bg-zinc-950 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'DAFTAR AKUN'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-medium text-zinc-400">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-bold text-zinc-200 hover:text-white hover:underline">
            Masuk disini
          </Link>
        </p>
      </div>
    </main>
  );
}