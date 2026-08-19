'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { formatRupiah, parseRawNumber } from '../utils/format';
import EmojiBackground from '../components/EmojiBackground';
import { History, BookOpen, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');

  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeTarget, setIncomeTarget] = useState('');

  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseSource, setExpenseSource] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState('Tempat Simpan Uang (Aset)');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: walletData } = await supabase.from('wallets').select('*');
    const { data: transData } = await supabase.from('transactions').select('*');

    setWallets(walletData || []);
    setTransactions(transData || []);
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netWorth = totalIncome - totalExpense;

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('transactions').insert([
      {
        user_id: user.id,
        type: 'pemasukan',
        description: incomeDesc,
        amount: parseRawNumber(incomeAmount),
        source_wallet: incomeSource,
        target_wallet: incomeTarget,
      },
    ]);

    setIncomeDesc('');
    setIncomeAmount('');
    setIncomeSource('');
    setIncomeTarget('');
    fetchData();
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('transactions').insert([
      {
        user_id: user.id,
        type: 'pengeluaran',
        description: expenseDesc,
        amount: parseRawNumber(expenseAmount),
        source_wallet: expenseSource,
        category: expenseCategory,
      },
    ]);

    setExpenseDesc('');
    setExpenseAmount('');
    setExpenseSource('');
    setExpenseCategory('');
    fetchData();
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('wallets').insert([
      {
        user_id: user.id,
        name: walletName,
        category_type: walletType,
      },
    ]);

    setWalletName('');
    setShowWalletModal(false);
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <main className="relative min-h-screen p-4 pb-20 md:p-8">
      <EmojiBackground />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-white uppercase sm:text-4xl">
              Svvagy Finance
            </h1>
            <p className="mt-1 text-xs font-extrabold tracking-widest text-zinc-400 uppercase sm:text-sm">
              WebApp Manajemen Keuangan Yang Mudah dan Gratis!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="self-start sm:self-auto border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99] flex items-center gap-2"
          >
            <LogOut size={14} /> LOGOUT
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 backdrop-blur-md shadow-xl">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              TOTAL KEKAYAAN BERSIH MU
            </p>
            <p className="mt-3 text-2xl font-black tracking-wider text-emerald-400 md:text-3xl">
              Rp {formatRupiah(netWorth.toString()) || '0'}
            </p>
          </div>
          <div className="border border-zinc-800 bg-zinc-900/90 p-6 backdrop-blur-md shadow-xl">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
              TOTAL PENGELUARAN MU
            </p>
            <p className="mt-3 text-2xl font-black tracking-wider text-red-400 md:text-3xl">
              Rp {formatRupiah(totalExpense.toString()) || '0'}
            </p>
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/90 p-6 backdrop-blur-md shadow-xl space-y-6">
          <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('pemasukan')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition border ${
                  activeTab === 'pemasukan'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                + CATATAN PEMASUKAN
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pengeluaran')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition border ${
                  activeTab === 'pengeluaran'
                    ? 'border-red-500 bg-red-500/10 text-red-400'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                + CATATAN PENGELUARAN
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowWalletModal(true)}
              className="self-start sm:self-auto text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 hover:text-white transition underline underline-offset-4"
            >
              + TAMBAH AKUN/DOMPET KUSTOM
            </button>
          </div>

          {activeTab === 'pemasukan' ? (
            <form onSubmit={handleSaveIncome} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  KETERANGAN
                </label>
                <input
                  type="text"
                  required
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  placeholder="* Masukan Keterangan"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  NOMINAL
                </label>
                <input
                  type="text"
                  required
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(formatRupiah(e.target.value))}
                  placeholder="* Masukan Nominal"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  SUMBER UANG MU (Dari Mana)
                </label>
                <input
                  type="text"
                  required
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  placeholder="* Input Sumber Uang"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  MAU DISIMPAN KE
                </label>
                <select
                  required
                  value={incomeTarget}
                  onChange={(e) => setIncomeTarget(e.target.value)}
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white outline-none transition focus:border-zinc-500"
                >
                  <option value="">-- Pilih Akun / Dompet --</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full border border-zinc-700 bg-zinc-950 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99]"
              >
                SIMPAN PEMASUKAN
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  KETERANGAN
                </label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="* Masukan Keterangan"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  NOMINAL
                </label>
                <input
                  type="text"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(formatRupiah(e.target.value))}
                  placeholder="* Masukan Nominal"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  BAYAR PAKAI APA (Sumber Uang/Dana)
                </label>
                <select
                  required
                  value={expenseSource}
                  onChange={(e) => setExpenseSource(e.target.value)}
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white outline-none transition focus:border-zinc-500"
                >
                  <option value="">-- Pilih Akun / Dompet --</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  KATEGORI PENGELUARAN
                </label>
                <input
                  type="text"
                  required
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  placeholder="* Input Nama Pengeluaran"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <button
                type="submit"
                className="w-full border border-zinc-700 bg-zinc-950 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99]"
              >
                SIMPAN PENGELUARAN
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/riwayat"
            className="border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99] flex items-center gap-2"
          >
            <History size={14} /> LIHAT SEMUA RIWAYAT TRANSAKSI
          </Link>
          <Link
            href="/pembukuan"
            className="border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99] flex items-center gap-2"
          >
            <BookOpen size={14} /> PERLU PEMBUKUAN ? KLIK DISINI YA
          </Link>
        </div>
      </div>

      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Tambah Akun / Dompet Kustom</h3>
            <form onSubmit={handleAddWallet} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  NAMA AKUN / DOMPET
                </label>
                <input
                  type="text"
                  required
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="* Masukan Nama Dompet, Cth: Gopay/Bank BCA/Cash"
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white placeholder-zinc-600 outline-none transition focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-widest text-zinc-400">
                  TIPE KATEGORI
                </label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="mt-1.5 w-full border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs font-medium text-white outline-none transition focus:border-zinc-500"
                >
                  <option value="Tempat Simpan Uang (Aset)">Tempat Simpan Uang (Aset)</option>
                  <option value="Pengeluaran (Beban)">Pengeluaran (Beban)</option>
                  <option value="Sumber Pendapatan">Sumber Pendapatan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99]"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:border-zinc-500 hover:bg-black active:scale-[0.99]"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}