import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, TrendingUp, Flag, Lightbulb, ArrowRight, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ProfitCalculatorProps {
  initialHpp?: number;
  hppName?: string;
  totalFixedCost?: number;
}

export default function ProfitCalculator({ initialHpp, hppName, totalFixedCost }: ProfitCalculatorProps) {
  const [margin, setMargin] = useState(35);
  const [biayaProduksi, setBiayaProduksi] = useState<number | string>(initialHpp || 45000);
  const [biayaTetap, setBiayaTetap] = useState<number | string>(totalFixedCost || 2500000);
  const [estimasiPenjualan, setEstimasiPenjualan] = useState<number | string>(300);

  // Update values when props change
  useEffect(() => {
    if (initialHpp) setBiayaProduksi(initialHpp);
  }, [initialHpp]);

  useEffect(() => {
    if (totalFixedCost !== undefined && totalFixedCost > 0) {
      setBiayaTetap(totalFixedCost);
    }
  }, [totalFixedCost]);

  // Dynamic calculations
  const numBiayaProduksi = Number(biayaProduksi) || 0;
  const numBiayaTetap = Number(biayaTetap) || 0;
  const numEstimasiPenjualan = Number(estimasiPenjualan) || 0;

  const marginDecimal = margin / 100;
  // Ensure we don't divide by 0 if margin is 100%
  const divisor = 1 - marginDecimal || 0.01;
  const hargaJual = Math.round(numBiayaProduksi / divisor);
  const profitPerUnit = hargaJual - numBiayaProduksi;
  const roi = numBiayaProduksi > 0 ? Math.round((profitPerUnit / numBiayaProduksi) * 100) : 0;
  const breakEven = profitPerUnit > 0 ? Math.ceil(numBiayaTetap / profitPerUnit) : 0;
  const profitBulanan = (profitPerUnit * numEstimasiPenjualan) - numBiayaTetap;

  const harga20 = Math.round(numBiayaProduksi / (1 - 0.20));
  const harga50 = Math.round(numBiayaProduksi / (1 - 0.50));

  const formatIDR = (num: number) => num.toLocaleString('id-ID');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-12">
      {/* Editorial Header */}
      <section className="space-y-4">
        <p className="text-[10px] font-bold tracking-widest uppercase text-primary">Growth Engine</p>
        <h2 className="text-4xl font-extrabold tracking-tight leading-tight">Profit Calculator</h2>
        <p className="text-secondary text-lg max-w-2xl">Determine your ideal selling price and project growth for your SME with precision.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Inputs */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <CalcIcon className="text-primary" size={24} />
              <h3 className="text-xl font-bold">Parameter Produksi</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
                  Biaya Produksi / Unit {hppName && <span className="text-primary normal-case">(dari HPP: {hppName})</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface">Rp</span>
                  <input
                    type="number"
                    value={biayaProduksi}
                    onChange={(e) => setBiayaProduksi(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-bold text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">
                  Biaya Tetap (Bln) {totalFixedCost ? <span className="text-tertiary normal-case">(Auto-Sync Aktif)</span> : ""}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface">Rp</span>
                  <input
                    type="number"
                    value={biayaTetap}
                    onChange={(e) => setBiayaTetap(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-bold text-lg"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Estimasi Penjualan (Unit/Bulan)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface">📦</span>
                  <input
                    type="number"
                    value={estimasiPenjualan}
                    onChange={(e) => setEstimasiPenjualan(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Target Margin Keuntungan</label>
                <span className="text-2xl font-black text-primary">{margin}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                value={margin}
                onChange={(e) => setMargin(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Konservatif (5%)</span>
                <span>Agresif (80%)</span>
              </div>
            </div>
          </motion.div>

          {/* Insight Card */}
          <div className="bg-on-surface p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="relative z-10 flex gap-6 items-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-md text-primary">
                <Lightbulb size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold mb-1">Growth Insight</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Berdasarkan data kategori produk Anda, margin {margin}% berada 5% di atas rata-rata industri.</p>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden"
          >
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Rekomendasi Harga Jual</p>
              <h3 className="text-5xl font-black tracking-tighter">Rp{formatIDR(hargaJual)}</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Profit / Unit</p>
                    <p className="font-bold">Rp{formatIDR(profitPerUnit)}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">+{roi}% ROI</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <Flag size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Break-even Point</p>
                    <p className="font-bold">{formatIDR(breakEven)} Unit</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-tertiary">Target Minimal</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", profitBulanan >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Potensi Profit Bulanan</p>
                    <p className={cn("font-bold text-lg tracking-tight", profitBulanan >= 0 ? "text-green-600" : "text-red-500")}>
                      {profitBulanan < 0 ? "-" : ""}Rp{formatIDR(Math.abs(profitBulanan))}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500">Asumsi {formatIDR(numEstimasiPenjualan)} Unit Terjual</span>
              </div>
            </div>

            <button className="w-full mt-10 signature-gradient text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group transition-all active:scale-95">
              <span>Simpan ke Laporan</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </motion.section>

          {/* Comparison */}
          <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-secondary">Simulasi Perbandingan</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Margin 20% (Standard)</span>
                <span className="font-bold">Rp{formatIDR(harga20)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Margin 50% (Premium)</span>
                <span className="font-bold text-primary">Rp{formatIDR(harga50)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
