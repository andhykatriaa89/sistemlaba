import { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InputExpense from './components/InputExpense';
import ProfitCalculator from './components/ProfitCalculator';
import Reports from './components/Reports';
import { ViewType, Transaction, FinancialSummary } from './types';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalProfit: 0,
    totalCapital: 0,
    totalRevenue: 0,
    profitGrowth: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchRiwayat = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/transaksi`);
      if (res.ok) {
        const data = await res.json();
        // Transform backend data to frontend model
        const mapped: Transaction[] = (data || []).map((t: any) => ({
          id: String(t.id),
          title: t.catatan || (t.pendapatan > 0 ? 'Penjualan Produk' : 'Pembelian Stok'),
          amount: t.pendapatan > 0 ? t.pendapatan : t.modal,
          type: t.pendapatan > 0 ? 'income' : 'expense',
          category: (t.items && t.items[0]) || (t.pendapatan > 0 ? 'Revenue' : 'Operational'),
          date: new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          status: t.pendapatan > 0 ? 'Success' : 'Paid',
        }));

        setTransactions(mapped);

        // Calculate summary
        const totalProfit = mapped.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        const totalRevenue = mapped.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalCapital = mapped.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        setSummary({
          totalProfit,
          totalCapital,
          totalRevenue,
          profitGrowth: 12.5, // Placeholder
        });
      }
    } catch (err) {
      console.error('Failing to fetch results:', err);
    }
  }, []);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  const handleSubmit = async (nama: string, jumlah: number, catatan: string, kategori: string, txType: 'income' | 'expense' = 'expense') => {
    setLoading(true);
    try {
      const isExpense = txType === 'expense';
      const payload = {
        pendapatan: isExpense ? 0 : jumlah,
        modal: isExpense ? jumlah : 0,
        catatan: catatan || nama,
        items: [kategori]
      };

      const res = await fetch(`${API}/api/hitung-laba`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchRiwayat();
        setActiveView('home');
      } else {
        alert('Gagal menyimpan transaksi. Pastikan koneksi dan backend Anda berjalan lancar.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Terjadi kesalahan sistem saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard transactions={transactions} summary={summary} onNavigate={setActiveView} />;
      case 'input':
        return <InputExpense onSubmit={handleSubmit} loading={loading} initialTransactions={transactions} />;
      case 'calculator':
        return <ProfitCalculator />;
      case 'reports':
        return <Reports transactions={transactions} summary={summary} />;
      default:
        return <Dashboard transactions={transactions} summary={summary} onNavigate={setActiveView} />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderView()}
    </Layout>
  );
}
