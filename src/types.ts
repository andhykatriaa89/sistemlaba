export type ViewType = 'home' | 'input' | 'calculator' | 'reports' | 'hpp' | 'fixed-costs';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  status: 'Paid' | 'Success' | 'Pending' | 'Overdue';
}

export interface FinancialSummary {
  totalProfit: number;
  totalCapital: number;
  totalRevenue: number;
  profitGrowth: number;
}

export interface BahanBaku {
  id: string;
  nama: string;
  satuan: string;
  harga_per_satuan: number;
}

export interface ResepItem {
  id?: string;
  produk_id?: string;
  bahan_baku_id: string;
  bahan_baku?: BahanBaku;
  jumlah: number;
}

export interface BiayaTetap {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  siklus: string;
}

export interface Produk {
  id: string;
  nama: string;
  hpp: number;
  resep: ResepItem[];
}
