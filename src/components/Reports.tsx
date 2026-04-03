import { TrendingUp, Receipt, Lightbulb, Search, Filter, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Trash2, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Transaction, FinancialSummary } from '../types';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface ReportsProps {
  transactions: Transaction[];
  summary: FinancialSummary;
  onDelete?: (id: string) => void;
}

export default function Reports({ transactions, summary, onDelete }: ReportsProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const filterByTime = (txs: Transaction[]) => {
    const now = new Date();
    return txs.filter((tx) => {
      const parts = tx.date.split(' ');
      if (parts.length < 2) return true;

      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11
      };
      const day = parseInt(parts[0]);
      const month = months[parts[1]] ?? now.getMonth();
      const txDate = new Date(now.getFullYear(), month, day);

      if (activeTab === 0) {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return txDate >= weekAgo;
      } else if (activeTab === 1) {
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      }
      return txDate.getFullYear() == now.getFullYear();
    });
  };
  const filteredTransactions = filterByTime(transactions).filter((tx) =>
    tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcel = async () => {
    const data: Record<string, string | number>[] = filteredTransactions.map((tx) => ({
      Tanggal: tx.date,
      Deskripsi: tx.title,
      Kategori: tx.category,
      Tipe: tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Status: tx.status,
      Jumlah: tx.type === 'income' ? tx.amount : -tx.amount,
    }));
    data.push(
      { Tanggal: '', Deskripsi: '', Kategori: '', Tipe: '', Status: '', Jumlah: 0 },
      { Tanggal: '', Deskripsi: 'Total Pemasukan', Kategori: '', Tipe: '', Status: '', Jumlah: summary.totalRevenue },
      { Tanggal: '', Deskripsi: 'Total Pengeluaran', Kategori: '', Tipe: '', Status: '', Jumlah: summary.totalCapital },
      { Tanggal: '', Deskripsi: 'Laba Bersih', Kategori: '', Tipe: '', Status: '', Jumlah: summary.totalProfit },
    );

    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');

    const tabLabels = ['Minggu_Ini', 'Bulan_Ini', 'Tahun_Ini'];
    const fileName = `Laporan_Keuangan_${tabLabels[activeTab]}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (Capacitor.isNativePlatform()) {
      // Native (iOS / Android): tulis file ke cache lalu share
      try {
        const base64Data = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: 'Laporan Keuangan',
          text: 'Export laporan keuangan dalam format Excel',
          url: result.uri,
          dialogTitle: 'Simpan atau Kirim Laporan',
        });
      } catch (err) {
        console.error('Export error:', err);
        alert('Gagal mengekspor file. Silakan coba lagi.');
      }
    } else {
      // Web: gunakan file-saver seperti biasa
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, fileName);
    }
  };
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
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      {/* Header & Filter */}
      <section className="space-y-6 text-left">
        <div className="space-y-1">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase text-secondary/70">Growth Analytics</p>
          <h2 className="text-4xl font-black tracking-tight text-[#0b1c30]">Financial Reports</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['This Week', 'This Month', 'This Year'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === idx ? "bg-[#006948] text-white shadow-lg shadow-primary/20" : "bg-white text-secondary hover:bg-slate-50 border border-slate-100"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Bento Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group border border-slate-50 text-left">
          <div className="relative z-10 space-y-6">
            <p className="text-[11px] font-black tracking-[0.2em] uppercase text-secondary/50">Total Net Profit</p>
            <h3 className="text-4xl font-black tracking-tighter text-[#0b1c30]">
              {summary.totalProfit < 0 ? '-' : ''}{formatRp(summary.totalProfit)}
            </h3>
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider",
                summary.totalProfit >= 0 ? "bg-[#c4f8e2] text-[#006948]" : "bg-red-100 text-red-600"
              )}>
                <TrendingUp size={14} className="mr-2" /> 12.5%
              </div>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest opacity-60">vs last week</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/2 rounded-full blur-3xl group-hover:bg-primary/5 transition-all"></div>
        </div>

        <div className="space-y-6 text-left">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-secondary/50 mb-2">Revenue</p>
            <h4 className="text-xl font-black text-[#0b1c30] tracking-tight">{formatShortRp(summary.totalRevenue)}</h4>
            <div className="mt-3 flex items-center text-[#006948] font-black text-[10px] uppercase tracking-widest">
              <ArrowUpRight size={14} className="mr-1.5" /> +8%
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase text-secondary/50 mb-2">Expenses</p>
            <h4 className="text-xl font-black text-[#0b1c30] tracking-tight">{formatShortRp(summary.totalCapital)}</h4>
            <div className="mt-3 flex items-center text-red-600 font-black text-[10px] uppercase tracking-widest">
              <ArrowDownRight size={14} className="mr-1.5" /> -3%
            </div>
          </div>
        </div>
      </section>

      {/* Daily Ledger Table */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
          <div>
            <h3 className="text-xl font-black text-[#0b1c30] tracking-tight">Daily Ledger</h3>
            <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Daftar Transaksi Lengkap</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-none focus:ring-2 focus:ring-primary/10 transition-all outline-none"
              />
            </div>
            <button className="p-3 bg-slate-50 text-secondary rounded-2xl hover:bg-slate-100 transition-colors border border-slate-50">
              <Filter size={20} />
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-5 py-3 bg-[#006948] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#005a3d] transition-colors shadow-lg shadow-primary/20"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50">Tanggal</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50">Deskripsi</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50">Kategori</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 text-right">Jumlah</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/50 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((tx) => (
                <LedgerRow
                  key={tx.id}
                  date={tx.date}
                  time="-"
                  title={tx.title}
                  category={tx.category}
                  status={tx.status === 'Success' ? 'Terbayar' : 'Tertunda'}
                  amount={`${tx.type === 'income' ? '+' : '-'} ${tx.amount.toLocaleString('id-ID')}`}
                  type={tx.type}
                  onDelete={() => onDelete && onDelete(tx.id)}
                />
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-secondary italic font-medium">Belum ada data transaksi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-slate-50/30 flex justify-between items-center text-left">
          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.15em]">Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi</p>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors shadow-sm">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary transition-colors shadow-sm">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Insight Section */}
      <section className="bg-[#c4f8e2]/20 p-8 rounded-[2.5rem] border border-[#c4f8e2]/40 relative overflow-hidden text-left">
        <div className="relative z-10 flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 bg-[#006948] text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
            <Lightbulb size={24} />
          </div>
          <div className="space-y-2 flex flex-col justify-center">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-[#0b1c30]">Growth Insight</h4>
            <p className="text-xs text-secondary/70 leading-relaxed max-w-2xl font-medium">
              Your revenue this month is <span className="text-[#006948] font-black tracking-tight">18% higher</span> than the previous period. Focus on maintaining current inventory turnover to maximize your profit margin.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function LedgerRow({ date, time, title, category, status, amount, type, onDelete }: any) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-8 py-6 text-left">
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#0b1c30] tracking-tight">{date}</span>
          <span className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">{time}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors">
            <Receipt size={18} />
          </div>
          <span className="text-sm font-black text-[#0b1c30] tracking-tight">{title}</span>
        </div>
      </td>
      <td className="px-8 py-6 text-left">
        <span className="px-3 py-1.5 bg-slate-100/50 text-[9px] font-black uppercase tracking-widest rounded-lg text-secondary">
          {category}
        </span>
      </td>
      <td className="px-8 py-6 text-left">
        <span className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
          status === 'Terbayar' ? "bg-[#c4f8e2] text-[#006948]" : "bg-red-50 text-red-600"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", status === 'Terbayar' ? "bg-[#006948]" : "bg-red-600")}></span>
          {status}
        </span>
      </td>
      <td className={cn("px-8 py-6 text-right font-black text-sm tracking-tight", type === 'income' ? "text-[#006948]" : "text-[#0b1c30]")}>
        {amount}
      </td>
      <td className="px-8 py-6 text-center">
        {onDelete && (
          <button onClick={onDelete} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Hapus">
            <Trash2 size={16} />
          </button>
        )}
      </td>
    </tr>
  );
}
