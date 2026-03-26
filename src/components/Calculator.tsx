'use client';

import { useState, useEffect } from 'react';

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

export default function Calculator() {
    const [pendapatan, setPendapatan] = useState('');
    const [modal, setModal] = useState('');
    const [catatan, setCatatan] = useState('');
    const [result, setResult] = useState<Transaksi | null>(null);
    const [riwayat, setRiwayat] = useState<Transaksi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRiwayat();
    }, []);

    async function fetchRiwayat() {
        try {
            const res = await fetch(`${API}/api/transaksi`);
            if (res.ok) {
                const data = await res.json();
                setRiwayat(data || []);
            }
        } catch {
            console.log('Backend belum terhubung');
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch(`${API}/api/hitung-laba`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pendapatan: parseFloat(pendapatan),
                    modal: parseFloat(modal),
                    catatan,
                    items: [],
                }),
            });

            if (!res.ok) throw new Error('Gagal menghitung');

            const data: Transaksi = await res.json();
            setResult(data);
            setPendapatan('');
            setModal('');
            setCatatan('');
            fetchRiwayat();
        } catch {
            setError('Gagal koneksi ke server. Pastikan backend berjalan.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: number) {
        try {
            await fetch(`${API}/api/transaksi/delete?id=${id}`, { method: 'DELETE' });
            fetchRiwayat();
        } catch {
            console.log('Gagal menghapus');
        }
    }

    function formatRp(n: number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeUp 0.6s ease' }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                    💰 Sistem Laba
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Hitung keuntungan usaha Anda dengan cepat
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
                backdropFilter: 'blur(20px)',
                marginBottom: 24,
                animation: 'fadeUp 0.6s ease 0.1s both',
            }}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Pendapatan (Omzet)
                    </label>
                    <input
                        type="number"
                        value={pendapatan}
                        onChange={(e) => setPendapatan(e.target.value)}
                        placeholder="5000000"
                        required
                        style={{
                            width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)',
                            fontSize: 16, outline: 'none',
                        }}
                    />
                </div>

                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Modal (Pengeluaran)
                    </label>
                    <input
                        type="number"
                        value={modal}
                        onChange={(e) => setModal(e.target.value)}
                        placeholder="3000000"
                        required
                        style={{
                            width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)',
                            fontSize: 16, outline: 'none',
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                        Catatan (Opsional)
                    </label>
                    <input
                        type="text"
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Penjualan bulan Maret..."
                        style={{
                            width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)',
                            fontSize: 16, outline: 'none',
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: 14, background: 'var(--accent)',
                        color: 'white', border: 'none', borderRadius: 10, fontSize: 16,
                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s',
                    }}
                >
                    {loading ? '⏳ Menghitung...' : '🧮 Hitung Laba'}
                </button>
            </form>

            {/* Error */}
            {error && (
                <div style={{
                    background: 'var(--red-glow)', border: '1px solid var(--red)',
                    borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 24,
                    color: 'var(--red)', fontSize: 14,
                }}>
                    ⚠ {error}
                </div>
            )}

            {/* Result */}
            {result && (
                <div style={{
                    background: 'var(--bg-card)', border: `1px solid ${result.status === 'Untung' ? 'var(--green)' : 'var(--red)'}`,
                    borderRadius: 16, padding: 24, marginBottom: 24,
                    boxShadow: `0 0 30px ${result.status === 'Untung' ? 'var(--green-glow)' : 'var(--red-glow)'}`,
                    animation: 'fadeUp 0.4s ease',
                }}>
                    <div style={{ textAlign: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 40 }}>{result.status === 'Untung' ? '🎉' : result.status === 'Rugi' ? '📉' : '⚖️'}</span>
                        <h3 style={{ fontSize: 20, marginTop: 8, color: result.status === 'Untung' ? 'var(--green)' : 'var(--red)' }}>
                            {result.status}
                        </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Pendapatan</p>
                            <p style={{ fontSize: 16, fontWeight: 600 }}>{formatRp(result.pendapatan)}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Modal</p>
                            <p style={{ fontSize: 16, fontWeight: 600 }}>{formatRp(result.modal)}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Laba Bersih</p>
                            <p style={{ fontSize: 16, fontWeight: 700, color: result.status === 'Untung' ? 'var(--green)' : 'var(--red)' }}>
                                {formatRp(result.laba_bersih)}
                            </p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12 }}>
                            <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Margin</p>
                            <p style={{ fontSize: 16, fontWeight: 600 }}>{result.margin.toFixed(1)}%</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Riwayat */}
            {riwayat.length > 0 && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: 24, animation: 'fadeUp 0.6s ease 0.2s both',
                }}>
                    <h3 style={{ fontSize: 16, marginBottom: 16 }}>📋 Riwayat Transaksi</h3>
                    {riwayat.map((t) => (
                        <div key={t.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 0', borderBottom: '1px solid var(--border)',
                        }}>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: t.status === 'Untung' ? 'var(--green)' : 'var(--red)' }}>
                                    {t.status}: {formatRp(t.laba_bersih)}
                                </p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {t.catatan || 'Tanpa catatan'} · {new Date(t.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(t.id)}
                                style={{
                                    background: 'transparent', border: '1px solid var(--red)',
                                    color: 'var(--red)', borderRadius: 6, padding: '4px 10px',
                                    fontSize: 12, cursor: 'pointer',
                                }}
                            >
                                🗑
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
