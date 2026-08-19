'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '../utils/supabase/client';
import { formatRupiah, parseRawNumber } from '../utils/format';
import EmojiBackground from '../components/EmojiBackground';
import { PlusCircle, History, BookOpen, LogOut, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

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
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: walletData } = await supabase.from('wallets').select('*');
    const { data: transData } = await supabase.from('transactions').select('*');

    setWallets(walletData || []);
    setTransactions(transData || []);
    setLoading(false);
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

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Loading...</div>;
  }

  return (
    <main className="relative min-h-screen p-4 pb-20 md:p-8">
      <EmojiBackground />

      <div className="mx-auto max-w-4xl space-y-6">

        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white md:text-3xl">Svvagy Finance</h1>
            <p className="text-xs text-zinc-400 md:text-sm">WebApp Manajemen Keuangan Yang Mudah dan Gratis!</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 hover:bg-red-500/20"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase text-zinc-400">TOTAL KEKAYAAN BERSIH MU</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400 md:text-3xl">
              Rp {formatRupiah(netWorth.toString()) || '0'}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase text-zinc-400">TOTAL PENGELUARANMU</p>
            <p className="mt-2 text-2xl font-bold text-red-400 md:text-3xl">
              Rp {formatRupiah(totalExpense.toString()) || '0'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <PlusCircle size={16} /> + TAMBAH AKUN/DOMPET KUSTOM
          </button>
          <Link
            href="/riwayat"
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-700"
          >
            <History size={16} /> LIHAT SEMUA RIWAYAT TRANSAKSI
          </Link>
          <Link
            href="/pembukuan"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
          >
            <BookOpen size={16} /> PERLU PEMBUKUAN ? KLIK DISINI YA
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Form Pemasukan */}
          <form onSubmit={handleSaveIncome} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur-sm">
            <h2 className="border-b border-zinc-800 pb-2 text-base font-bold text-emerald-400">FORM PEMASUKAN</h2>
            
            <div>
              <label className="block text-xs text-zinc-400">KETERANGAN</label>
              <input
                type="text"
                required
                value={incomeDesc}
                onChange={(e) => setIncomeDesc(e.target.value)}
                placeholder="Gaji / Project / Hadiah"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">NOMINAL</label>
              <input
                type="text"
                required
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(formatRupiah(e.target.value))}
                placeholder="0"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">SUMBER UANG MU (Dari Mana)</label>
              <input
                type="text"
                required
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value)}
                placeholder="Klien / Perusahaan / Transfer"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">MAU DISIMPAN KE</label>
              <select
                required
                value={incomeTarget}
                onChange={(e) => setIncomeTarget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              >
                <option value="">-- Pilih Akun / Dompet --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
            >
              Simpan Pemasukan
            </button>
          </form>

          <form onSubmit={handleSaveExpense} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/90 p-5 backdrop-blur-sm">
            <h2 className="border-b border-zinc-800 pb-2 text-base font-bold text-red-400">FORM PENGELUARAN</h2>

            <div>
              <label className="block text-xs text-zinc-400">KETERANGAN</label>
              <input
                type="text"
                required
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="Beli Makan / Token Listrik"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">NOMINAL</label>
              <input
                type="text"
                required
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(formatRupiah(e.target.value))}
                placeholder="0"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400">BAYAR PAKAI APA (Sumber Uang/Dana)</label>
              <select
                required
                value={expenseSource}
                onChange={(e) => setExpenseSource(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              >
                <option value="">-- Pilih Akun / Dompet --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400">KATEGORI PENGELUARAN</label>
              <input
                type="text"
                required
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                placeholder="Makanan / Transportasi / Hiburan"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-500"
            >
              Simpan Pengeluaran
            </button>
          </form>
        </div>
      </div>

      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-bold text-white">Tambah Akun / Dompet Kustom</h3>
            <form onSubmit={handleAddWallet} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400">NAMA AKUN / DOMPET</label>
                <input
                  type="text"
                  required
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="BCA / GoPay / Cash"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400">TIPE KATEGORI</label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
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
                  className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}