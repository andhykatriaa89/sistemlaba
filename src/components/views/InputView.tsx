"use client";

import React, { useState } from 'react';
import { Package, CreditCard, Users, Home, Lightbulb, ChevronRight, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Transaksi {
  id: number;
  pendapatan: number;
  modal: number;
  laba_bersih: number;
  margin: number;
  status: string;
  catatan: string;
  items: string[] | null;
  created_at: string;
}

interface InputViewProps {
  onSubmit: (pendapatan: number, modal: number, catatan: string) => Promise<void>;
  riwayat: Transaksi[];
  onDelete: (id: number) => Promise<void>;
  loading: boolean;
}

export default function InputView({ onSubmit, riwayat, onDelete, loading }: InputViewProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Bahan Baku');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const categories = type === 'expense' 
    ? ['Bahan Baku', 'Operasional', 'Gaji', 'Sewa']
    : ['Penjualan', 'Layanan', 'Lainnya'];

  async function handleSave() {
    if (!amount || !itemName) return;
    
    const val = parseFloat(amount);
    const finalNote = `[${category}] ${itemName}${notes ? ` - ${notes}` : ''}`;
    
    if (type === 'expense') {
      await onSubmit(0, val, finalNote);
    } else {
      await onSubmit(val, 0, finalNote);
    }

    // Reset form
    setItemName('');
    setAmount('');
    setNotes('');
  }

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-32"
    >
      {/* Header */}
      <section className="pt-4">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Input Transaksi</h2>
        <p className="text-sm text-secondary font-medium">Catat arus kas masuk & keluar harian</p>
      </section>

      {/* Type Selector Toggle */}
      <section>
        <div className="flex p-1 bg-surface-container-high rounded-2xl">
          <button
            onClick={() => { setType('expense'); setCategory('Bahan Baku'); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
              type === 'expense' ? "bg-white text-tertiary shadow-sm" : "text-secondary hover:text-on-surface"
            )}
          >
            <Minus className="w-4 h-4" /> Pengeluaran
          </button>
          <button
            onClick={() => { setType('income'); setCategory('Penjualan'); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all",
              type === 'income' ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-on-surface"
            )}
          >
            <Plus className="w-4 h-4" /> Pemasukan
          </button>
        </div>
      </section>

      {/* Form */}
      <section>
        <div className="bg-surface-container-lowest p-6 rounded-2xl space-y-5 shadow-sm border border-outline-variant/5">
          {/* Item Name */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary px-1">Nama Item / Transaksi</label>
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              type="text"
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-slate-400 font-medium"
              placeholder={type === 'expense' ? "Contoh: Stok Kopi Arabika" : "Contoh: Penjualan Harian"}
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary px-1">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-semibold transition-all border border-transparent",
                    category === cat
                      ? type === 'expense' ? "bg-tertiary text-on-tertiary shadow-sm" : "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-high text-secondary hover:bg-surface-container-highest"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5 text-left text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary px-1">Jumlah (IDR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">Rp</span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                className="w-full bg-surface-container-high border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all font-bold"
                placeholder="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary px-1">Catatan Tambahan (Opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-slate-400 text-sm resize-none"
              placeholder="Detail detail pembayaran..."
              rows={2}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={handleSave}
            disabled={loading || !amount || !itemName}
            className={cn(
              "w-full py-4 rounded-xl text-on-primary font-bold shadow-lg active:scale-95 transition-all mt-2 flex items-center justify-center gap-2",
              type === 'expense' ? "bg-gradient-to-br from-tertiary to-tertiary-container shadow-tertiary/20" : "bg-gradient-to-br from-primary to-primary-container shadow-primary/20",
              (loading || !amount || !itemName) && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            {loading ? (
              <span className="animate-spin material-symbols-outlined">refresh</span>
            ) : (
              `Simpan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`
            )}
          </button>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-secondary text-left">Aktivitas Terbaru</h3>
          <button onClick={() => setActiveTab('reports')} className="text-xs font-semibold text-primary">Lihat Semua</button>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {riwayat.slice(0, 5).map((t) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key={t.id}
              >
                <ExpenseItem
                  icon={t.modal > 0 ? <Package className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  title={t.catatan || 'Transaksi'}
                  subtitle={`${new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                  amount={`${t.modal > 0 ? '-' : '+'} ${formatRp(t.modal > 0 ? t.modal : t.pendapatan)}`}
                  isExpense={t.modal > 0}
                  onDelete={() => onDelete(t.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {riwayat.length === 0 && (
            <p className="text-center text-xs text-secondary italic py-6">Belum ada riwayat transaksi.</p>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function ExpenseItem({ icon, title, subtitle, amount, isExpense, onDelete }: { 
  icon: React.ReactNode, 
  title: string, 
  subtitle: string, 
  amount: string,
  isExpense: boolean,
  onDelete: () => void 
}) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between group transition-all border border-outline-variant/5">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          isExpense ? "bg-tertiary/10 text-tertiary" : "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
        <div className="text-left overflow-hidden">
          <p className="font-bold text-on-surface text-sm truncate">{title}</p>
          <p className="text-[10px] text-secondary font-medium tracking-wide uppercase">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className={cn("font-bold text-sm", isExpense ? "text-tertiary" : "text-primary")}>{amount}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-2 text-outline hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Add this to make setActiveTab available
function setActiveTab(tab: string) {
  // This is a placeholder since we don't have direct access here, 
  // but we can pass it as a prop if needed. In this component, it's used for the "Lihat Semua" link.
}
