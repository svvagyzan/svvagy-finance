'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import { formatRupiah } from '../../utils/format';
import EmojiBackground from '../../components/EmojiBackground';
import { ArrowLeft } from 'lucide-react';

export default function RiwayatPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <main className="relative min-h-screen p-4 md:p-8">
      <EmojiBackground />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Riwayat Transaksi dan Catatan</h1>
            <p className="text-xs text-zinc-400">SEMUA TRANSAKSI DAN CATATAN KAMU ADA DISINI</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-sm text-zinc-500">Memuat riwayat...</p>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm font-semibold text-zinc-500">
            BELUM ADA RIWAYAT TRANSAKSI DAN CATATAN
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-sm"
              >
                <div>
                  <p className="font-bold text-white">{t.description}</p>
                  <p className="text-xs text-zinc-400">
                    {new Date(t.created_at).toLocaleString('id-ID')} | {t.source_wallet || '-'}
                  </p>
                </div>
                <div
                  className={`text-sm font-extrabold ${
                    t.type === 'pemasukan' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {t.type === 'pemasukan' ? '+' : '-'} Rp {formatRupiah(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}