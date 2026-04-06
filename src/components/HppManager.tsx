import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Ruler, Check, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { BahanBaku, Produk, ResepItem } from '../types';

interface HppManagerProps {
  onUseInCalculator: (hpp: number, nama: string) => void;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function HppManager({ onUseInCalculator }: HppManagerProps) {
  const [activeTab, setActiveTab] = useState<'bahan' | 'resep' | 'ringkasan'>('bahan');
  const [bahanBaku, setBahanBaku] = useState<BahanBaku[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newBahan, setNewBahan] = useState({ nama: '', satuan: '', harga_per_satuan: 0 });
  const [newProduk, setNewProduk] = useState<{ nama: string; resep: ResepItem[] }>({ nama: '', resep: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resBahan, resProduk] = await Promise.all([
        fetch(`${API}/api/bahan-baku`),
        fetch(`${API}/api/produk`)
      ]);
      if (resBahan.ok) setBahanBaku(await resBahan.json());
      if (resProduk.ok) setProduk(await resProduk.json());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBahan = async () => {
    if (!newBahan.nama || !newBahan.satuan) {
      alert('Nama bahan dan satuan harus diisi!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/bahan-baku/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBahan)
      });
      if (res.ok) {
        setNewBahan({ nama: '', satuan: '', harga_per_satuan: 0 });
        fetchData();
        alert('Bahan baku berhasil ditambahkan!');
      } else {
        const errorText = await res.text();
        alert('Gagal menyimpan: ' + errorText);
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi ke server. Pastikan backend sudah menyala.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBahan = async (id: string) => {
    if (!window.confirm('Hapus bahan baku?')) return;
    try {
      const res = await fetch(`${API}/api/bahan-baku/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResepItem = (bahanId: string) => {
    const bahan = bahanBaku.find(b => b.id === bahanId);
    if (!bahan) return;
    
    setNewProduk(prev => ({
      ...prev,
      resep: [...prev.resep, { bahan_baku_id: bahanId, jumlah: 0, bahan_baku: bahan }]
    }));
  };

  const updateResepJumlah = (index: number, jumlah: number) => {
    const updated = [...newProduk.resep];
    updated[index].jumlah = jumlah;
    setNewProduk(prev => ({ ...prev, resep: updated }));
  };

  const removeResepItem = (index: number) => {
    setNewProduk(prev => ({
      ...prev,
      resep: prev.resep.filter((_, i) => i !== index)
    }));
  };

  const calculateHPP = () => {
    return newProduk.resep.reduce((acc, item) => {
      const bahan = bahanBaku.find(b => b.id === item.bahan_baku_id);
      return acc + (item.jumlah * (bahan?.harga_per_satuan || 0));
    }, 0);
  };

  const handleSaveProduk = async () => {
    if (!newProduk.nama || newProduk.resep.length === 0) return;
    
    const hpp = calculateHPP();
    const payload = {
      nama: newProduk.nama,
      hpp,
      resep: newProduk.resep.map(r => ({ bahan_baku_id: r.bahan_baku_id, jumlah: r.jumlah }))
    };

    try {
      const res = await fetch(`${API}/api/produk/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setNewProduk({ nama: '', resep: [] });
        fetchData();
        setActiveTab('ringkasan');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduk = async (id: string) => {
    if (!window.confirm('Hapus produk & resep ini?')) return;
    try {
      const res = await fetch(`${API}/api/produk/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatIDR = (num: number) => num.toLocaleString('id-ID');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Package size={24} />
          </div>
          <h2 className="text-3xl font-black tracking-tight">HPP Otomatis</h2>
        </div>
        <p className="text-secondary">Kelola bahan baku dan kalkulasi modal produk secara real-time.</p>
      </section>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        {(['bahan', 'resep', 'ringkasan'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-white text-primary shadow-sm" : "text-secondary hover:text-primary"
            )}
          >
            {tab === 'bahan' ? 'Bahan Baku' : tab === 'resep' ? 'Buat Resep' : 'Ringkasan HPP'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'bahan' && (
          <motion.div
            key="bahan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Form Tambah Bahan */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Nama Bahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Susu Segar"
                  value={newBahan.nama}
                  onChange={(e) => setNewBahan({ ...newBahan, nama: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Satuan</label>
                <input
                  type="text"
                  placeholder="Contoh: Liter, Kg, Gram"
                  value={newBahan.satuan}
                  onChange={(e) => setNewBahan({ ...newBahan, satuan: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Harga / Satuan</label>
                <input
                  type="number"
                  value={newBahan.harga_per_satuan || ''}
                  onChange={(e) => setNewBahan({ ...newBahan, harga_per_satuan: Number(e.target.value) })}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                onClick={handleAddBahan}
                disabled={loading}
                className={cn(
                  "bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-opacity",
                  loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                )}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Plus size={20} />
                )}
                <span>{loading ? 'Menyimpan...' : 'Tambah'}</span>
              </button>
            </div>

            {/* List Bahan */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-secondary">
                  <tr>
                    <th className="px-6 py-4">Bahan Baku</th>
                    <th className="px-6 py-4">Satuan</th>
                    <th className="px-6 py-4">Harga / Satuan</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bahanBaku.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold">{b.nama}</td>
                      <td className="px-6 py-4 text-secondary">{b.satuan}</td>
                      <td className="px-6 py-4 font-medium text-primary">Rp{formatIDR(b.harga_per_satuan)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteBahan(b.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {bahanBaku.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-secondary italic">Belum ada data bahan baku.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'resep' && (
          <motion.div
            key="resep"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Pilih Produk & Bahan (Kiri) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block">Nama Produk</label>
                  <input
                    type="text"
                    placeholder="Contoh: Es Kopi Susu Aren"
                    value={newProduk.nama}
                    onChange={(e) => setNewProduk({ ...newProduk, nama: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/20 font-bold"
                  />
                </div>
                
                <div className="pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-3">Pilih Bahan Baku</label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {bahanBaku.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleAddResepItem(b.id)}
                        disabled={newProduk.resep.some(r => r.bahan_baku_id === b.id)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group text-sm"
                      >
                        <span className="font-medium group-disabled:text-slate-300">{b.nama}</span>
                        <Plus size={16} className="text-primary group-disabled:text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Komposisi Resep (Kanan) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                <h3 className="text-xl font-black mb-6">Komposisi Bahan</h3>
                
                <div className="space-y-4 mb-10">
                  {newProduk.resep.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl relative group">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">{item.bahan_baku?.nama}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={item.jumlah || ''}
                            onChange={(e) => updateResepJumlah(index, Number(e.target.value))}
                            className="w-24 bg-white border-none rounded-lg p-2 font-bold text-lg focus:ring-2 focus:ring-primary/20"
                            placeholder="0"
                          />
                          <span className="text-sm font-bold text-slate-400">{item.bahan_baku?.satuan}</span>
                        </div>
                      </div>
                      <div className="text-right pr-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Subtotal</p>
                        <p className="font-bold text-primary">Rp{formatIDR(item.jumlah * (item.bahan_baku?.harga_per_satuan || 0))}</p>
                      </div>
                      <button
                        onClick={() => removeResepItem(index)}
                        className="absolute right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}

                  {newProduk.resep.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-secondary">
                      <Ruler className="mx-auto mb-3 opacity-20" size={48} />
                      <p className="text-sm">Pilih bahan baku di sebelah kiri untuk mulai membuat resep.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[1.5rem] border border-primary/10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Total HPP per Unit</p>
                    <h4 className="text-3xl font-black text-on-surface">Rp{formatIDR(calculateHPP())}</h4>
                  </div>
                  <button
                    onClick={handleSaveProduk}
                    disabled={!newProduk.nama || newProduk.resep.length === 0}
                    className="signature-gradient text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-30 flex items-center gap-2"
                  >
                    <Save size={20} />
                    <span>Simpan Resep</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'ringkasan' && (
          <motion.div
            key="ringkasan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {produk.map((p) => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-black">{p.nama}</h4>
                  <button
                    onClick={() => handleDeleteProduk(p.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Modal / HPP</p>
                    <p className="text-xl font-bold text-primary">Rp{formatIDR(p.hpp)}</p>
                  </div>
                  
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 space-y-1">
                    <p className="mb-2">Komposisi:</p>
                    {p.resep.map((r, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{r.bahan_baku?.nama} ({r.jumlah} {r.bahan_baku?.satuan})</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onUseInCalculator(p.hpp, p.nama)}
                    className="w-full flex items-center justify-between p-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/10 group active:scale-95 transition-all"
                  >
                    <span>Gunakan di Kalkulator</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}

            {produk.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-secondary italic">Belum ada resep produk yang dibuat.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal/Indicator */}
      <div className="bg-on-surface p-6 rounded-3xl text-white flex items-center gap-6 relative overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <Info size={24} />
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong>Tip HPP Otomatis:</strong> Setiap kali Anda mengupdate harga bahan baku di tab "Bahan Baku", 
          HPP di seluruh resep yang menggunakan bahan tersebut akan otomatis terupdate. Anda tidak perlu lagi menghitung ulang secara manual.
        </p>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>
    </div>
  );
}
