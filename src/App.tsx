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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  // Load initial pending count
  useEffect(() => {
    const p = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
    setPendingCount(p.length);
  }, []);

  const fetchRiwayat = useCallback(async () => {
    // 1. Coba ambil dari LocalStorage dulu (Optimistic Load)
    const localTx = localStorage.getItem('cached_transactions');
    const localSum = localStorage.getItem('cached_summary');
    if (localTx) setTransactions(JSON.parse(localTx));
    if (localSum) setSummary(JSON.parse(localSum));

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
        localStorage.setItem('cached_transactions', JSON.stringify(mapped));

        // Calculate summary
        const totalProfit = mapped.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
        const totalRevenue = mapped.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalCapital = mapped.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const newSummary = {
          totalProfit,
          totalCapital,
          totalRevenue,
          profitGrowth: 12.5, // Placeholder
        };
        setSummary(newSummary);
        localStorage.setItem('cached_summary', JSON.stringify(newSummary));
      }
    } catch (err) {
      console.log('Mode Offline: Membaca dari Gudang Kecil.');
    }
  }, []);

  const syncPendingData = useCallback(async () => {
    const pending = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
    if (pending.length === 0) return;

    setLoading(true);
    let successCount = 0;
    const remaining = [];

    for (const p of pending) {
      try {
        const res = await fetch(`${API}/api/hitung-laba`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        });
        if (res.ok) successCount++;
        else remaining.push(p);
      } catch (e) {
        remaining.push(p);
      }
    }

    localStorage.setItem('pending_transactions', JSON.stringify(remaining));
    setPendingCount(remaining.length);

    if (successCount > 0) {
      await fetchRiwayat(); // Refresh data after successful sync
      alert(`Berhasil sinkronisasi ${successCount} transaksi ke database!`);
    } else {
      alert('Gagal menyinkronkan data. Pastikan server aktif.');
    }
    setLoading(false);
  }, [fetchRiwayat]);

  useEffect(() => {
    fetchRiwayat();
    
    // Offline/Online Listeners
    const handleOnline = () => {
      setIsOffline(false);
      // Sinkronisasi manual sekarang, tombol akan muncul.
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
        throw new Error("Server error");
      }
    } catch (err) {
      // Simpan Ke Gudang Kecil - Offline First
      const isExpense = txType === 'expense';
      const payload = {
        pendapatan: isExpense ? 0 : jumlah,
        modal: isExpense ? jumlah : 0,
        catatan: catatan || nama,
        items: [kategori]
      };

      const pending = JSON.parse(localStorage.getItem('pending_transactions') || '[]');
      pending.push(payload);
      localStorage.setItem('pending_transactions', JSON.stringify(pending));
      setPendingCount(pending.length);

      // Optimistic UI Update
      const tempTx: Transaction = {
        id: `temp_${Date.now()}`,
        title: payload.catatan,
        amount: payload.pendapatan > 0 ? payload.pendapatan : payload.modal,
        type: payload.pendapatan > 0 ? 'income' : 'expense',
        category: payload.items[0],
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        status: 'Pending'
      };
      
      const newTxs = [tempTx, ...transactions];
      setTransactions(newTxs);
      localStorage.setItem('cached_transactions', JSON.stringify(newTxs));

      alert('Tersimpan di Gudang Kecil (Offline). Akan disinkronisasi ketika sinyal internet pulih!');
      setActiveView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('temp_')) {
      alert('Transaksi offline yang sedang disinkronisasi belum dapat dihapus. Tunggu hingga masuk ke Database.');
      return;
    }
    if (!navigator.onLine || isOffline) {
      alert('Mode Offline Aktif! Anda membutuhkan koneksi internet untuk menghapus data dari Database.');
      return;
    }
    
    if (window.confirm('Yakin ingin menghapus transaksi ini? Data tidak bisa dikembalikan.')) {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/transaksi/delete?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          await fetchRiwayat();
        } else {
          alert('Gagal menghapus transaksi dari server.');
        }
      } catch (err) {
        console.error('Delete error:', err);
        alert('Terjadi kesalahan jaringan saat menghapus.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <Dashboard transactions={transactions} summary={summary} onNavigate={setActiveView} />;
      case 'input':
        return <InputExpense onSubmit={handleSubmit} loading={loading} initialTransactions={transactions} onDelete={handleDelete} />;
      case 'calculator':
        return <ProfitCalculator />;
      case 'reports':
        return <Reports transactions={transactions} summary={summary} onDelete={handleDelete} />;
      default:
        return <Dashboard transactions={transactions} summary={summary} onNavigate={setActiveView} />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} isOffline={isOffline} pendingCount={pendingCount} onSync={syncPendingData}>
      {renderView()}
    </Layout>
  );
}
