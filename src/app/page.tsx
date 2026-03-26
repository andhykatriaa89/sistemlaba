'use client';

import { useState, useEffect } from 'react';
import { TopAppBar, BottomNavBar } from '@/components/Navigation';
import DashboardView from '@/components/views/DashboardView';
import InputView from '@/components/views/InputView';
import CalculatorView from '@/components/views/CalculatorView';
import ReportsView from '@/components/views/ReportsView';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [riwayat, setRiwayat] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState(false);

  useEffect(() => {
    fetchRiwayat();
  }, []);

  async function fetchRiwayat() {
    try {
      const res = await fetch(`${API}/api/transaksi`);
      if (res.ok) {
        const data = await res.json();
        setRiwayat(data || []);
        setBackendError(false);
      } else {
        setBackendError(true);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
      setBackendError(true);
    }
  }

  async function handleSubmit(pendapatan: number, modal: number, catatan: string) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/hitung-laba`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendapatan, modal, catatan, items: [] }),
      });

      if (res.ok) {
        await fetchRiwayat();
        setActiveTab('dashboard'); // Switch to dashboard after success
      }
    } catch (err) {
      console.error('Gagal menyimpan:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`${API}/api/transaksi/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRiwayat();
      }
    } catch (err) {
      console.error('Gagal menghapus:', err);
    }
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView riwayat={riwayat} setActiveTab={setActiveTab} />;
      case 'input':
        return (
          <InputView
            onSubmit={handleSubmit}
            riwayat={riwayat}
            onDelete={handleDelete}
            loading={loading}
          />
        );
      case 'calculator':
        return <CalculatorView />;
      case 'reports':
        return <ReportsView riwayat={riwayat} />;
      default:
        return <DashboardView riwayat={riwayat} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <TopAppBar />
      <main className="px-6 pt-20">
        {backendError && (
          <div className="mb-4 p-4 bg-tertiary/10 border border-tertiary/30 rounded-xl flex items-center gap-3 text-tertiary animate-fade-up">
            <span className="material-symbols-outlined">cloud_off</span>
            <div className="text-left text-xs">
              <p className="font-bold">Backend Offline</p>
              <p className="opacity-80">Pastikan server Go berjalan di http://localhost:8080</p>
            </div>
          </div>
        )}
        {renderView()}
      </main>
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
