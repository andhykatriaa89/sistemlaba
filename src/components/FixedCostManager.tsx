import { useState, useEffect } from 'react';
import { Wallet, Plus, Trash2, ShieldCheck, PieChart, Info, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { BiayaTetap } from '../types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function FixedCostManager() {
  const [fixedCosts, setFixedCosts] = useState<BiayaTetap[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCost, setNewCost] = useState({ nama: '', kategori: 'Lainnya', jumlah: 0, siklus: 'Bulanan' });

  const kategoriOptions = ['Sewa', 'Gaji', 'Listrik/Air', 'Internet', 'Pemasaran', 'Lainnya'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/biaya-tetap`);
      if (res.ok) setFixedCosts(await res.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCost.nama || newCost.jumlah <= 0) {
      alert('Nama dan jumlah harus diisi!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/biaya-tetap/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCost)
      });
      if (res.ok) {
        setNewCost({ nama: '', kategori: 'Lainnya', jumlah: 0, siklus: 'Bulanan' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus biaya tetap ini?')) return;
    try {
      const res = await fetch(`${API}/api/biaya-tetap/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalMonthly = fixedCosts.reduce((acc, curr) => {
    if (curr.siklus === 'Tahunan') return acc + (curr.jumlah / 12);
    return acc + curr.jumlah;
  }, 0);

  const formatIDR = (num: number) => num.toLocaleString('id-ID');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
            <Landmark size={24} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">Manajemen Biaya Tetap</h2>
        </div>
        <p className="text-secondary">Kelola pengeluaran rutin operasional untuk perhitungan BEP yang akurat.</p>
      </section>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-on-surface p-8 rounded-[2rem] text-white relative overflow-hidden flex flex-col justify-between min-h-[160px]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Biaya Tetap / Bulan</p>
            <h3 className="text-4xl font-black">Rp{formatIDR(totalMonthly)}</h3>
          </div>
          <div className="flex gap-2 items-center text-xs text-slate-400">
            <ShieldCheck size={14} className="text-primary" />
            <span>Angka ini akan otomatis digunakan di Kalkulator Profit.</span>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-secondary mb-3">
            <PieChart size={24} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Items Tercatat</p>
          <h4 className="text-2xl font-black">{fixedCosts.length} Biaya</h4>
        </div>
      </div>

      {/* Form Tambah */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Nama Pengeluaran</label>
          <input
            type="text"
            placeholder="Contoh: Sewa Ruko"
            value={newCost.nama}
            onChange={(e) => setNewCost({ ...newCost, nama: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Kategori</label>
          <select
            value={newCost.kategori}
            onChange={(e) => setNewCost({ ...newCost, kategori: e.target.value })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 appearance-none"
          >
            {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Jumlah (Rp)</label>
          <input
            type="number"
            value={newCost.jumlah || ''}
            onChange={(e) => setNewCost({ ...newCost, jumlah: Number(e.target.value) })}
            className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 font-bold"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={loading}
          className="bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={20} />}
          <span>{loading ? '...' : 'Tambah'}</span>
        </button>
      </div>

      {/* List Biaya Tetap */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-secondary">
            <tr>
              <th className="px-8 py-5">Deskripsi</th>
              <th className="px-8 py-5">Kategori</th>
              <th className="px-8 py-5">Siklus</th>
              <th className="px-8 py-5">Jumlah</th>
              <th className="px-8 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {fixedCosts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <p className="font-bold">{c.nama}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs bg-slate-100 px-2.5 py-1 rounded-full font-medium text-slate-600">{c.kategori}</span>
                </td>
                <td className="px-8 py-5 text-secondary text-sm">{c.siklus}</td>
                <td className="px-8 py-5">
                  <p className="font-bold text-on-surface">Rp{formatIDR(c.jumlah)}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {fixedCosts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-secondary italic">
                  Belum ada biaya tetap tercatat. Masukkan pengeluaran rutin Anda di atas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Tip Card */}
      <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
          <Info size={20} />
        </div>
        <p className="text-sm text-secondary leading-relaxed">
          <strong>Penting:</strong> Biaya tetap adalah biaya yang jumlahnya tidak berubah meskipun jumlah produksi meningkat. 
          Sistem akan menjumlahkan semua biaya di atas untuk menghitung "Biaya Tetap" di Kalkulator Profit Anda.
        </p>
      </div>
    </div>
  );
}
