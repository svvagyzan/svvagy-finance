'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '../../utils/supabase/client';
import { formatRupiah, parseRawNumber } from '../../utils/format';
import EmojiBackground from '../../components/EmojiBackground';
import { ArrowLeft, Plus, Trash2, Edit2, Upload, X } from 'lucide-react';

export default function PembukuanPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetDetails, setAssetDetails] = useState<any[]>([]);

  const [newAssetName, setNewAssetName] = useState('');

  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fileProof, setFileProof] = useState<File | null>(null);
  const [customPaymentMethods, setCustomPaymentMethods] = useState<string[]>(['BCA', 'Gopay', 'Cash']);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');

  const [editingDetail, setEditingDetail] = useState<any>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editFileProof, setEditFileProof] = useState<File | null>(null);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    setAssets(data || []);
    setLoading(false);
  };

  const fetchAssetDetails = async (assetId: string) => {
    const { data } = await supabase
      .from('asset_details')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });
    setAssetDetails(data || []);
  };

  const handleSelectAsset = (asset: any) => {
    setSelectedAsset(asset);
    fetchAssetDetails(asset.id);
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('assets').insert([{ user_id: user.id, name: newAssetName }]);
    setNewAssetName('');
    fetchAssets();
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Yakin ingin menghapus aset ini beserta seluruh rinciannya?')) return;
    await supabase.from('assets').delete().eq('id', assetId);
    setSelectedAsset(null);
    fetchAssets();
  };

  const uploadProofFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `proofs/${fileName}`;

    const { error } = await supabase.storage.from('transfer-proofs').upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from('transfer-proofs').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let proofUrl = null;
    if (fileProof) {
      proofUrl = await uploadProofFile(fileProof);
    }

    await supabase.from('asset_details').insert([
      {
        asset_id: selectedAsset.id,
        user_id: user.id,
        item_name: itemName,
        amount: parseRawNumber(amount),
        payment_method: paymentMethod,
        proof_url: proofUrl,
      },
    ]);

    setItemName('');
    setAmount('');
    setPaymentMethod('');
    setFileProof(null);
    fetchAssetDetails(selectedAsset.id);
  };

  const handleDeleteDetail = async (detailId: string) => {
    if (!confirm('Hapus rincian pengeluaran ini?')) return;
    await supabase.from('asset_details').delete().eq('id', detailId);
    fetchAssetDetails(selectedAsset.id);
  };

  const handleStartEdit = (detail: any) => {
    setEditingDetail(detail);
    setEditItemName(detail.item_name);
    setEditAmount(formatRupiah(detail.amount.toString()));
    setEditPaymentMethod(detail.payment_method);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    let proofUrl = editingDetail.proof_url;

    if (editFileProof) {
      proofUrl = await uploadProofFile(editFileProof);
    }

    await supabase
      .from('asset_details')
      .update({
        item_name: editItemName,
        amount: parseRawNumber(editAmount),
        payment_method: editPaymentMethod,
        proof_url: proofUrl,
      })
      .eq('id', editingDetail.id);

    setEditingDetail(null);
    setEditFileProof(null);
    fetchAssetDetails(selectedAsset.id);
  };

  const totalAccumulatedExpense = assetDetails.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <main className="relative min-h-screen p-4 md:p-8">
      <EmojiBackground />

      <div className="mx-auto max-w-5xl space-y-6">

        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Pembukuan</h1>
            <p className="text-xs text-zinc-400 uppercase">BREAKDOWN PENGELUARANMU</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
          >
            <ArrowLeft size={16} /> BACK
          </Link>
        </div>

        <form onSubmit={handleAddAsset} className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 backdrop-blur-sm">
          <input
            type="text"
            required
            value={newAssetName}
            onChange={(e) => setNewAssetName(e.target.value)}
            placeholder="Masukkan Nama Aset Baru (misal: Laptop Kerja, Rumah A)..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 flex items-center gap-1"
          >
            <Plus size={16} /> TAMBAH ASET
          </button>
        </form>

        {loading ? (
          <p className="text-center text-xs text-zinc-500">Memuat aset...</p>
        ) : assets.length === 0 ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-xs font-bold text-zinc-400">
            BELUM ADA ASET, SILAHKAN BUAT ASET PERTAMA KAMU
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleSelectAsset(asset)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  selectedAsset?.id === asset.id
                    ? 'bg-blue-600 text-white'
                    : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                {asset.name}
              </button>
            ))}
          </div>
        )}

        {selectedAsset && (
          <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedAsset.name}</h2>
                <p className="mt-1 text-xs text-zinc-400">
                  TOTAL AKUMULASI PENGELUARAN:{' '}
                  <span className="font-bold text-red-400">Rp {formatRupiah(totalAccumulatedExpense.toString())}</span>
                </p>
              </div>
              <button
                onClick={() => handleDeleteAsset(selectedAsset.id)}
                className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20"
              >
                <Trash2 size={14} /> HAPUS ASET
              </button>
            </div>

            <form onSubmit={handleSaveDetail} className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-zinc-300">Tambah Rincian Pengeluaran Aset</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="block text-[10px] text-zinc-400">NAMA ITEM</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Servis / Sparepart"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400">NOMINAL</label>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={(e) => setAmount(formatRupiah(e.target.value))}
                    placeholder="0"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400">METODE PEMBAYARAN</label>
                  <div className="mt-1 flex gap-1">
                    <select
                      required
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                    >
                      <option value="">-- Pilih --</option>
                      {customPaymentMethods.map((method, idx) => (
                        <option key={idx} value={method}>{method}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddMethodModal(true)}
                      className="rounded-lg bg-zinc-800 px-2.5 text-xs text-zinc-300 hover:bg-zinc-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400">BUKTI TRANSFER (FOTO/MEDIA)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFileProof(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-xs text-zinc-400 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-xs file:text-zinc-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
              >
                SIMPAN RINCIAN
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-zinc-800 bg-zinc-950/50 text-[10px] uppercase text-zinc-400">
                  <tr>
                    <th className="p-3">Nama Rincian</th>
                    <th className="p-3">Waktu Penambahan</th>
                    <th className="p-3">Nominal</th>
                    <th className="p-3">Metode</th>
                    <th className="p-3">Bukti</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {assetDetails.map((detail) => (
                    <tr key={detail.id} className="hover:bg-zinc-800/30">
                      <td className="p-3 font-semibold text-white">{detail.item_name}</td>
                      <td className="p-3 text-zinc-400">{new Date(detail.created_at).toLocaleString('id-ID')}</td>
                      <td className="p-3 font-bold text-red-400">Rp {formatRupiah(detail.amount)}</td>
                      <td className="p-3">{detail.payment_method}</td>
                      <td className="p-3">
                        {detail.proof_url ? (
                          <a
                            href={detail.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 underline hover:text-blue-300"
                          >
                            Lihat Bukti
                          </a>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(detail)}
                            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteDetail(detail.id)}
                            className="rounded p-1 text-red-400 hover:bg-zinc-800 hover:text-red-300"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAddMethodModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h4 className="text-sm font-bold text-white">Tambah Metode Pembayaran</h4>
              <input
                type="text"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                placeholder="misal: QRIS, Bank Mandiri..."
                className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMethodModal(false)}
                  className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-300"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newMethodName.trim()) {
                      setCustomPaymentMethods([...customPaymentMethods, newMethodName.trim()]);
                      setPaymentMethod(newMethodName.trim());
                      setNewMethodName('');
                      setShowAddMethodModal(false);
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  SIMPAN METODE
                </button>
              </div>
            </div>
          </div>
        )}

        {editingDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-base font-bold text-white">Form Edit Rincian Pengeluaran</h3>
              <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-[10px] text-zinc-400">NAMA PENGELUARAN</label>
                  <input
                    type="text"
                    required
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400">NOMINAL</label>
                  <input
                    type="text"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(formatRupiah(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400">METODE PEMBAYARAN</label>
                  <input
                    type="text"
                    required
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-zinc-400">GANTI BUKTI (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditFileProof(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-xs text-zinc-400 file:mr-2 file:rounded-md file:border-0 file:bg-zinc-800 file:px-2 file:py-1 file:text-xs file:text-zinc-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingDetail(null)}
                    className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    SIMPAN PERUBAHAN
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}