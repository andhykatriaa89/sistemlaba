'use client';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function TopAppBar() {
  return (
    <header className="fixed top-0 w-full max-w-md z-50 bg-slate-50/70 dark:bg-slate-900/70 backdrop-blur-xl">
      <div className="flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img
              alt="User"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuALHMddWM26R7NiMveqt-ivmsNQufteNyU88h572LwOOMTrEHqoy3hdDQjuIHuwgXFxB1l6h_vV9tYHX-iUCIDS4_LHgP8eHkfX7ncQ0Y8zBr8SltKppuDY4Lawjh3tcOnUsKeZqZ5sJi-X-S9n95RYJhKeXXihUI1zOoef5-L1qIQ0R8sAuQFBmc5Ah-8JBxOz14D6W7dpZGexAb4RAtpdnnBvssDge8QbN4zz3PcLBaOviiC450bFKLLSupqLVPPuH6TY4nLtCUb4"
            />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Profit Ledger
          </h1>
        </div>
        <button className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors p-2 rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
      <div className="bg-slate-200/50 dark:bg-slate-800/50 h-px w-full"></div>
    </header>
  );
}

export function BottomNavBar({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'dashboard' },
    { id: 'input', label: 'Input', icon: 'add_circle' },
    { id: 'calculator', label: 'Calculator', icon: 'calculate' },
    { id: 'reports', label: 'Reports', icon: 'analytics' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-md mx-auto">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100 dark:border-slate-800">
        <div className="flex justify-around items-center px-4 pb-6 pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-emerald-500 active:scale-95'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === tab.id ? 'fill-icon' : ''}`}
                style={{ fontVariationSettings: `'FILL' ${activeTab === tab.id ? 1 : 0}` }}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase mt-1">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
