"use client";

import React, { useState } from 'react';
import { Calculator as CalcIcon, TrendingUp, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export default function CalculatorView() {
  const [productionCost, setProductionCost] = useState(0);
  const [margin, setMargin] = useState(35);
  const [fixedCosts, setFixedCosts] = useState(5000000);

  const recommendedPrice = productionCost / (1 - margin / 100);
  const profitPerUnit = recommendedPrice - productionCost;
  const breakEven = profitPerUnit > 0 ? Math.ceil(fixedCosts / profitPerUnit) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-32"
    >
      {/* Header */}
      <section className="pt-4 text-left">
        <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-1">Growth Engine</p>
        <h2 className="text-3xl font-black tracking-tight text-on-surface leading-tight">Profit Calculator</h2>
        <p className="text-secondary text-sm mt-2 leading-relaxed">Proritaskan pengerjaan modal dan harga jual untuk UMKM Anda dengan presisi.</p>
      </section>

      {/* Input Form */}
      <section>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_32px_-4px_rgba(11,28,48,0.05)] border border-outline-variant/10 space-y-6">
          <div className="space-y-5">
            {/* Production Cost */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary">Production Cost Per Unit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-medium">Rp</span>
                <input
                  type="number"
                  value={productionCost || ''}
                  onChange={(e) => setProductionCost(Number(e.target.value))}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface font-bold focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Margin Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary">Desired Profit Margin</label>
                <span className="text-primary font-bold">{margin}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Fixed Costs */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-secondary">Monthly Fixed Costs (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-medium">Rp</span>
                <input
                  type="number"
                  value={fixedCosts || ''}
                  onChange={(e) => setFixedCosts(Number(e.target.value))}
                  className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface font-bold focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all"
                  placeholder="5,000,000"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">Include rent, electricity, and salaries.</p>
            </div>
          </div>

          <button className="w-full mt-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
            <CalcIcon className="w-5 h-5" />
            Calculate Recommendation
          </button>
        </div>
      </section>

      {/* Results */}
      <section className="space-y-4 pb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-secondary ml-1">Calculation Results</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Recommended Price */}
          <div className="col-span-2 bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Recommended Selling Price</p>
              <p className="text-3xl font-black tracking-tighter mt-1">
                Rp {recommendedPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 bg-on-primary-container/20 px-2 py-1 rounded-md text-[10px] font-bold">
                <TrendingUp className="w-3 h-3" />
                Market Optimized
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Profit Per Unit */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Profit / Unit</p>
            <p className="text-lg font-bold text-primary">
              Rp {profitPerUnit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* Break-even */}
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Break-even</p>
            <p className="text-lg font-bold text-on-surface">{breakEven} Units</p>
          </div>
        </div>

        {/* Insight */}
        <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary/30">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">Growth Insight</h4>
              <p className="text-xs text-secondary mt-1 leading-relaxed">
                Selling at this price covers your costs and builds a healthy cash reserve for expansion. Consider bulk-buy discounts for orders over 10 units.
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
