export type ViewType = 'home' | 'input' | 'calculator' | 'reports';

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
