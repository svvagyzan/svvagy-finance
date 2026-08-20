'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import { formatRupiah } from '../../utils/format';
import EmojiBackground from '../../components/EmojiBackground';
import { ArrowLeft } from 'lucide-react';

export default function RiwayatPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    setTransactions(data || []);
    setLoading(false);
  };

  return (
    <main className="relative min-h-screen p-4 pb-20 md:p-8">
      <EmojiBackground />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-white uppercase sm:text-4xl">
              Riwayat Transaksi dan Catatan
            </h1>
            <p className="mt-1 text-xs font-extrabold tracking-widest text-zinc-400 uppercase sm:text-sm">
              SEMUA TRANSAKSI DAN CATATAN KAMU ADA DISINI
            </p>
          </div>
          <Link
            href="/"
            className="self-start sm:self-auto border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99] flex items-center gap-2"
          >
            <ArrowLeft size={14} /> BACK
          </Link>
        </div>

        {loading ? (
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 text-center text-xs font-extrabold uppercase tracking-widest text-zinc-500">
            Memuat riwayat...
          </div>
        ) : transactions.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-900/90 p-8 text-center text-xs font-black uppercase tracking-widest text-zinc-400">
            BELUM ADA RIWAYAT TRANSAKSI
          </div>
        ) : (
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between border border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur-md shadow-xl transition hover:border-zinc-700"
              >
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest text-white">
                    {t.description}
                  </p>
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    {new Date(t.created_at).toLocaleString('id-ID')} | {t.type === 'pemasukan' ? (t.target_wallet || t.source_wallet || '-') : (t.source_wallet || '-')}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-black tracking-wider ${
                      t.type === 'pemasukan' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {t.type === 'pemasukan' ? '+ ' : '- '}Rp {formatRupiah(t.amount.toString())}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}