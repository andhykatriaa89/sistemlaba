"use client";

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronRight, Wallet, Calendar, History, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'motion/react';
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

interface ReportsViewProps {
  riwayat: Transaksi[];
}

export default function ReportsView({ riwayat }: ReportsViewProps) {
  const [filter, setFilter] = useState('Semua');

  const totalProfit = riwayat.reduce((acc, t) => acc + t.laba_bersih, 0);
  const totalRevenue = riwayat.reduce((acc, t) => acc + t.pendapatan, 0);
  const totalExpenses = riwayat.reduce((acc, t) => acc + t.modal, 0);

  function formatRp(n: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Math.abs(n));
  }

  function formatShortRp(n: number) {
    if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}k`;
    return formatRp(n);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-32"
    >
      {/* Header & Filtering */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] font-bold tracking-widest uppercase text-secondary/70">Growth Analytics</span>
          <h2 className="text-2xl font-black tracking-tight text-on-surface">Financial Reports</h2>
        </div>

        {/* Chips Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['Semua', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'].map((f) => (
            <FilterChip 
              key={f} 
              label={f} 
              active={filter === f} 
              onClick={() => setFilter(f)} 
            />
          ))}
        </div>
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-surface-container-lowest p-6 rounded-2xl shadow-sm relative overflow-hidden group border border-outline-variant/5 text-left">
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-widest uppercase text-secondary/60 mb-1">Total Net Profit</p>
            <h3 className="text-3xl font-black text-on-surface tracking-tighter">
              {totalProfit < 0 ? '-' : ''}{formatRp(totalProfit)}
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <div className={cn(
                "flex items-center font-bold text-sm px-2 py-0.5 rounded-lg",
                totalProfit >= 0 ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
              )}>
                {totalProfit >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {totalProfit >= 0 ? 'Strong' : 'Down'}
              </div>
              <span className="text-xs text-secondary/60">Overall performance</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        </div>

        <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-outline-variant/10 text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase text-secondary/60 mb-2">Revenue</p>
          <h4 className="text-lg font-bold text-on-surface tracking-tight">{formatShortRp(totalRevenue)}</h4>
          <div className="mt-3 flex items-center text-primary font-bold text-xs">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Active
          </div>
        </div>

        <div className="bg-surface-container-high/40 p-5 rounded-2xl border border-outline-variant/10 text-left">
          <p className="text-[10px] font-bold tracking-widest uppercase text-secondary/60 mb-2">Expenses</p>
          <h4 className="text-lg font-bold text-on-surface tracking-tight">{formatShortRp(totalExpenses)}</h4>
          <div className="mt-3 flex items-center text-tertiary font-bold text-xs">
            <ArrowDownRight className="w-3 h-3 mr-1" />
            Managed
          </div>
        </div>
      </section>

      {/* Daily Ledger */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-secondary/80">Daily Ledger</h3>
          <button className="text-[10px] font-bold text-primary flex items-center uppercase tracking-widest">
            Latest {riwayat.length} <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="space-y-1">
          {riwayat.map((t) => (
            <LedgerItem
              key={t.id}
              icon={t.modal > 0 ? <ArrowDownRight className="w-5 h-5 text-tertiary" /> : <ArrowUpRight className="w-5 h-5 text-primary" />}
              date={new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              transactions={t.catatan || 'Transaksi'}
              amount={`${t.modal > 0 ? '-' : '+'} ${formatShortRp(t.modal > 0 ? t.modal : t.pendapatan)}`}
              trend={t.modal > 0 ? "Dipped" : "Strong"}
              type={t.modal > 0 ? 'negative' : 'positive'}
            />
          ))}
          {riwayat.length === 0 && (
            <p className="text-center text-sm text-secondary italic py-10">Belum ada catatan buku besar.</p>
          )}
        </div>
      </section>

      {/* Growth Insight */}
      <section className="bg-primary/5 p-6 rounded-3xl border border-primary/10 relative overflow-hidden text-left">
        <div className="relative z-10 flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-1">Growth Insight</h4>
            <p className="text-xs text-secondary leading-relaxed">
              Total keuntungan bersih Anda saat ini adalah <span className="text-primary font-bold">{formatRp(totalProfit)}</span>. Fokus pada manajemen pengeluaran operasional untuk memaksimalkan margin keuntungan.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function FilterChip({ label, active, onClick }: { label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-widest",
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "bg-surface-container-highest text-secondary hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}

function LedgerItem({ icon, date, transactions, amount, trend, type }: {
  icon: React.ReactNode,
  date: string,
  transactions: string,
  amount: string,
  trend: string,
  type: 'positive' | 'negative'
}) {
  return (
    <div className="group flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-slate-50 transition-all duration-200 border border-outline-variant/5">
      <div className="flex items-center gap-4 overflow-hidden">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          type === 'positive' ? "bg-primary/10" : "bg-tertiary/10"
        )}>
          {icon}
        </div>
        <div className="text-left overflow-hidden">
          <p className="font-bold text-on-surface text-sm">{date}</p>
          <p className="text-[11px] text-secondary font-medium tracking-wide truncate">{transactions}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("font-black text-sm", type === 'positive' ? "text-primary" : "text-tertiary")}>{amount}</p>
        <p className={cn(
          "text-[10px] font-bold flex items-center justify-end uppercase tracking-tighter",
          type === 'positive' ? "text-primary" : "text-tertiary"
        )}>
          {trend}
        </p>
      </div>
    </div>
  );
}
