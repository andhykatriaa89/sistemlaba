"use client";

import React from 'react';
import { TrendingUp, ShoppingBag, DollarSign, Zap, ChevronRight, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const data = [
  { name: 'MAY', value: 40 },
  { name: 'JUN', value: 60 },
  { name: 'JUL', value: 50 },
  { name: 'AUG', value: 85, peak: true },
  { name: 'SEP', value: 70 },
];

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

interface DashboardViewProps {
  riwayat: Transaksi[];
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ riwayat, setActiveTab }: DashboardViewProps) {
  const totalProfit = riwayat.reduce((acc, t) => acc + t.laba_bersih, 0);
  const totalRevenue = riwayat.reduce((acc, t) => acc + t.pendapatan, 0);
  const totalCapital = riwayat.reduce((acc, t) => acc + t.modal, 0);

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
      {/* Summary Section */}
      <section className="space-y-4 pt-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Financial Summary</h2>
          <span className="text-xs font-medium text-secondary uppercase tracking-wider text-right">Overall</span>
        </div>

        {/* Main Profit Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-[2rem] p-8 text-on-primary shadow-xl">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-sm uppercase tracking-[0.15em] opacity-80">Total Profit</span>
            <h3 className="text-4xl font-black tracking-tighter">
              {totalProfit < 0 ? '-' : ''}{formatRp(totalProfit)}
            </h3>
            <div className="flex items-center gap-2 mt-4 inline-flex px-3 py-1 bg-white/20 rounded-full backdrop-blur-md">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Growth analysis active</span>
            </div>
          </div>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10 text-left">
            <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">Total Capital</span>
            <span className="text-lg font-bold text-on-surface">{formatShortRp(totalCapital)}</span>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10 text-left">
            <span className="text-[10px] uppercase tracking-widest text-secondary block mb-1">Total Revenue</span>
            <span className="text-lg font-bold text-on-surface">{formatShortRp(totalRevenue)}</span>
          </div>
        </div>
      </section>

      {/* Growth Trend Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Growth Trend</h2>
          <button className="text-xs font-semibold text-primary flex items-center gap-1">
            Details <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-surface-container-low p-6 rounded-[1.5rem] h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: '#515f74' }}
                dy={10}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.peak ? '#006948' : '#00694840'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface tracking-tight">Recent Activity</h2>
          <span className="text-xs font-medium text-secondary uppercase tracking-widest text-right">
            Latest {Math.min(3, riwayat.length)}
          </span>
        </div>

        <div className="space-y-3">
          {riwayat.slice(0, 3).map((t) => (
            <ActivityItem
              key={t.id}
              icon={t.status === 'Untung' ? <DollarSign className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              title={t.catatan || (t.status === 'Untung' ? 'Sales Revenue' : 'Operational/Expense')}
              subtitle={new Date(t.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              amount={`${t.laba_bersih >= 0 ? '+' : ''}${formatShortRp(t.laba_bersih)}`}
              status={t.status === 'Untung' ? 'Success' : 'Paid'}
              isNegative={t.laba_bersih < 0}
            />
          ))}
          {riwayat.length === 0 && (
            <p className="text-center text-sm text-secondary italic py-8">Belum ada aktivitas.</p>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <button 
        onClick={() => setActiveTab('input')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-[0_12px_32px_-4px_rgba(0,105,72,0.3)] flex items-center justify-center active:scale-90 transition-transform z-40 outline-none"
      >
        <Plus className="w-8 h-8" />
      </button>
    </motion.div>
  );
}

function ActivityItem({ icon, title, subtitle, amount, status, isNegative }: {
  icon: React.ReactNode,
  title: string,
  subtitle: string,
  amount: string,
  status: string,
  isNegative?: boolean
}) {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between transition-transform active:scale-95 border border-outline-variant/5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-on-surface text-sm">{title}</span>
          <span className="text-[11px] text-secondary">{subtitle}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={cn("block font-bold text-sm", isNegative ? "text-tertiary" : "text-primary")}>
          {amount}
        </span>
        <span className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
          isNegative ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-primary/10 text-primary"
        )}>
          {status}
        </span>
      </div>
    </div>
  );
}
