import React, { useState } from 'react';
import { Save, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Transaction } from '../types';

interface InputExpenseProps {
  onSubmit: (nama: string, jumlah: number, catatan: string, kategori: string, type: 'income'|'expense') => void;
  loading: boolean;
  initialTransactions: Transaction[];
}

export default function InputExpense({ onSubmit, loading, initialTransactions }: InputExpenseProps) {
  const [nama, setNama] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [catatan, setCatatan] = useState('');
  const [category, setCategory] = useState('Bahan Baku');

  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  // Dynamic categories based on transaction type
  const expenseCategories = ['Bahan Baku', 'Operasional', 'Gaji', 'Sewa'];
  const incomeCategories = ['Penjualan Produk', 'Layanan', 'Lainnya'];
  
  const categories = txType === 'expense' ? expenseCategories : incomeCategories;

  // Sync category state when type changes
  const handleTypeChange = (newType: 'expense' | 'income') => {
    setTxType(newType);
    setCategory(newType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah) return;
    onSubmit(nama, parseFloat(jumlah), catatan, category, txType);
  };

  const latestExpenses = initialTransactions.filter(t => t.type === 'expense').slice(0, 3);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="space-y-1 text-left flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">Input Transaksi</h2>
          <p className="text-sm text-secondary font-medium">Catat arus kas masuk & keluar</p>
        </div>
      </div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6"
      >
        <div className="flex bg-slate-50 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={cn("flex-1 py-3 text-sm font-bold rounded-lg transition-all", txType === 'expense' ? "bg-white text-tertiary shadow-sm" : "text-secondary hover:text-on-surface")}
          >
            Pengeluaran
          </button>
          <button 
            type="button"
            onClick={() => handleTypeChange('income')}
            className={cn("flex-1 py-3 text-sm font-bold rounded-lg transition-all", txType === 'income' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface")}
          >
            Pemasukan
          </button>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1">Nama Item</label>
          <input 
            type="text" 
            placeholder="Contoh: Stok Kopi Arabika"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium text-on-surface outline-none"
            required
          />
        </div>

        <div className="space-y-3 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1">Kategori</label>
          <div className="flex flex-wrap gap-2 text-left">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-5 py-2 rounded-full text-xs font-bold transition-all",
                  category === cat 
                    ? (txType === 'expense' ? "bg-tertiary text-white shadow-lg shadow-tertiary/20" : "bg-primary text-white shadow-lg shadow-primary/20")
                    : "bg-slate-50 text-secondary hover:bg-slate-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1">Jumlah (IDR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface">Rp</span>
              <input 
                type="number" 
                placeholder="0"
                value={jumlah}
                onChange={(e) => setJumlah(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-black text-lg text-on-surface outline-none"
                required
                min="1"
              />
            </div>
          </div>
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1">Tanggal</label>
            <input 
              type="text" 
              value={new Date().toLocaleDateString('id-ID')}
              readOnly
              className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 font-medium text-on-surface cursor-not-allowed outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <label className="text-[10px] font-bold uppercase tracking-widest text-secondary px-1">Catatan Tambahan</label>
          <textarea 
            placeholder="Detail opsional..."
            rows={3}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-medium resize-none text-on-surface outline-none"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={cn(
            "w-full text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest",
            loading ? "opacity-70 cursor-not-allowed bg-slate-400 shadow-none" : (txType === 'expense' ? "bg-tertiary shadow-tertiary/20 hover:opacity-90" : "bg-primary shadow-primary/20 hover:opacity-90")
          )}
        >
          <Save size={20} />
          {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </motion.form>

      {/* Recent Activity Mini List */}
      <section className="space-y-4 text-left">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-secondary">Aktivitas Terbaru</h4>
          <button className="text-xs font-bold text-primary uppercase tracking-widest">Lihat Semua</button>
        </div>
        <div className="space-y-3">
          {latestExpenses.map((tx) => (
            <RecentItem 
              key={tx.id}
              title={tx.title} 
              meta={`${tx.category} • ${tx.date}`} 
              amount={`-Rp ${tx.amount.toLocaleString('id-ID')}`} 
            />
          ))}
          {latestExpenses.length === 0 && (
            <p className="text-center text-xs text-secondary italic py-8">Belum ada pengeluaran.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function RecentItem({ title, meta, amount }: { title: string, meta: string, amount: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between group active:bg-slate-50 transition-colors shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary">
          <Package size={18} />
        </div>
        <div className="text-left">
          <p className="font-black text-sm text-on-surface">{title}</p>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{meta}</p>
        </div>
      </div>
      <p className="font-black text-tertiary text-sm tracking-tight">{amount}</p>
    </div>
  );
}
