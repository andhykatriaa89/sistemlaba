import React from 'react';
import { LayoutDashboard, PlusCircle, Calculator, BarChart3, Bell, Settings, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOffline?: boolean;
  pendingCount?: number;
  onSync?: () => void;
}

export default function Layout({ children, activeView, onViewChange, isOffline = false, pendingCount = 0, onSync }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col p-4 gap-2 border-r border-slate-100 bg-white z-50">
        <div className="flex items-center gap-3 mb-8 px-2 py-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-on-surface tracking-tight">Sistem Laba Laba</h2>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">Premium Tier</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeView === 'home'}
            onClick={() => onViewChange('home')}
          />
          <NavItem
            icon={<PlusCircle size={20} />}
            label="Input Transaksi"
            active={activeView === 'input'}
            onClick={() => onViewChange('input')}
          />
          <NavItem
            icon={<Calculator size={20} />}
            label="Kalkulator Profit"
            active={activeView === 'calculator'}
            onClick={() => onViewChange('calculator')}
          />
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Laporan Keuangan"
            active={activeView === 'reports'}
            onClick={() => onViewChange('reports')}
          />
          <NavItem
            icon={<Package size={20} />}
            label="HPP Otomatis"
            active={activeView === 'hpp'}
            onClick={() => onViewChange('hpp')}
          />
        </nav>

        <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <p className="text-xs text-secondary mb-3">Maximize your potential with data insights.</p>
          <button className="w-full signature-gradient text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-all">
            Upgrade Plan : 085158811702 Contact Info
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              PL
            </div>
            <h1 className="text-lg font-bold tracking-tight">Sistem Laba</h1>
            
            {/* OFFLINE INDICATORS */}
            {isOffline ? (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Offline
              </span>
            ) : pendingCount > 0 ? (
              <button 
                onClick={onSync}
                className="ml-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span className="hidden sm:inline">Sync ke Database</span>
                <span className="sm:hidden">Sync</span>
                ({pendingCount})
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-secondary hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full border-2 border-white"></span>
            </button>
            <button className="hidden sm:block p-2 text-secondary hover:bg-slate-50 rounded-full transition-colors">
              <Settings size={20} />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:block text-sm font-semibold">User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-t border-slate-100 px-4 pb-6 pt-3">
          <div className="flex justify-around items-center max-w-md mx-auto">
            <MobileNavItem
              icon={<LayoutDashboard size={20} />}
              label="Home"
              active={activeView === 'home'}
              onClick={() => onViewChange('home')}
            />
            <MobileNavItem
              icon={<PlusCircle size={20} />}
              label="Input"
              active={activeView === 'input'}
              onClick={() => onViewChange('input')}
            />
            <MobileNavItem
              icon={<Calculator size={20} />}
              label="Calc"
              active={activeView === 'calculator'}
              onClick={() => onViewChange('calculator')}
            />
            <MobileNavItem
              icon={<BarChart3 size={20} />}
              label="Reports"
              active={activeView === 'reports'}
              onClick={() => onViewChange('reports')}
            />
            <MobileNavItem
              icon={<Package size={20} />}
              label="HPP"
              active={activeView === 'hpp'}
              onClick={() => onViewChange('hpp')}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-secondary hover:bg-primary/5 hover:text-primary"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function MobileNavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all duration-200",
        active ? "text-primary bg-primary/5" : "text-secondary"
      )}
    >
      {React.cloneElement(icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
        fill: active ? "currentColor" : "none",
        strokeWidth: active ? 2.5 : 2
      })}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
