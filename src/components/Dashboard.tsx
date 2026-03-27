import { TrendingUp, ShoppingBag, CreditCard, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { GROWTH_DATA } from '../constants';
import { cn } from '../lib/utils';
import { Transaction, FinancialSummary } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  onNavigate?: (view: 'calculator') => void;
}

export default function Dashboard({ transactions, summary, onNavigate }: DashboardProps) {
  const latestTransactions = transactions.slice(0, 3);
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary mb-1">Financial Overview</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface">Selamat Pagi, Kak.</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
          <span className="text-sm font-medium text-secondary">{currentDate}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden text-left"
        >
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total Profit</span>
              <div className="bg-white/20 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1">
                <TrendingUp size={12} /> +{summary.profitGrowth}%
              </div>
            </div>
            <h3 className="text-3xl font-black tracking-tighter">
              Rp {(summary.totalProfit / 1000).toLocaleString('id-ID')}k
            </h3>
            <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider text-left">vs previous month</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left font-bold"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Total Capital</span>
          <h3 className="text-2xl font-black text-on-surface">
            Rp {(summary.totalCapital / 1000000).toFixed(1)}M
          </h3>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: '66%' }}></div>
          </div>
          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest text-left">Capital Allocation</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 text-left font-bold"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Total Revenue</span>
          <h3 className="text-2xl font-black text-on-surface">
            Rp {(summary.totalRevenue / 1000000).toFixed(1)}M
          </h3>
          <div className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-widest text-left">
            <TrendingUp size={12} /> +8.2% <span className="text-secondary font-bold ml-1">Gross Revenue</span>
          </div>
        </motion.div>
      </section>

      {/* Growth Trend & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Trend Chart */}
        <section className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-black text-lg text-on-surface">Growth Trend</h4>
            <button className="text-[10px] font-extrabold text-primary flex items-center gap-0.5 uppercase tracking-widest">
              Details <ChevronRight size={14} />
            </button>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {GROWTH_DATA.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative">
                  {item.isPeak && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0b1c30] text-white text-[8px] px-2 py-1 rounded font-black tracking-widest uppercase shadow-lg">
                      PEAK
                    </div>
                  )}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.value}%` }}
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-300",
                      item.isPeak ? "bg-[#006948]" : "bg-[#006948]/20 group-hover:bg-[#006948]/40"
                    )}
                  />
                </div>
                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{item.month}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="lg:col-span-5 space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-lg text-on-surface">Recent Activity</h4>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">Latest {latestTransactions.length}</span>
          </div>
          <div className="space-y-3">
            {latestTransactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between group active:scale-95 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    tx.type === 'income' ? "bg-primary/5 text-primary" : "bg-tertiary/10 text-tertiary"
                  )}>
                    {tx.type === 'income' ? <CreditCard size={18} /> : <ShoppingBag size={18} />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-on-surface">{tx.title}</p>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-black tracking-tight", tx.type === 'income' ? "text-primary" : "text-tertiary")}>
                    {tx.type === 'income' ? '+' : '-'}Rp {(tx.amount / 1000).toLocaleString('id-ID')}k
                  </p>
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    tx.status === 'Success' ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-tertiary"
                  )}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
            {latestTransactions.length === 0 && (
              <p className="text-center text-xs text-secondary italic py-8">Belum ada aktivitas.</p>
            )}
          </div>
        </section>
      </div>

      {/* Promo Card */}
      <section className="bg-[#0b1c30] p-8 rounded-[2.5rem] text-white relative overflow-hidden group text-left">
        <div className="relative z-10 max-w-md space-y-4">
          <h4 className="text-xl font-black tracking-tight">Butuh Bantuan Kalkulasi?</h4>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">Gunakan Kalkulator Profit cerdas kami untuk mensimulasikan kenaikan harga bahan baku terhadap margin keuntungan Anda.</p>
          <button 
            onClick={() => onNavigate && onNavigate('calculator')}
            className="bg-primary text-white px-8 py-3 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            Buka Kalkulator
          </button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>
      </section>
    </div>
  );
}
