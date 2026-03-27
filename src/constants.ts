import { Transaction, FinancialSummary } from './types';

export const MOCK_SUMMARY: FinancialSummary = {
  totalProfit: 24850000,
  totalCapital: 12400000,
  totalRevenue: 37200000,
  profitGrowth: 12.5,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Stock Purchase',
    amount: 1200000,
    type: 'expense',
    category: 'Operational',
    date: 'Today, 14:20',
    status: 'Paid',
  },
  {
    id: '2',
    title: 'Product Sales',
    amount: 4500000,
    type: 'income',
    category: 'Revenue',
    date: 'Yesterday',
    status: 'Success',
  },
  {
    id: '3',
    title: 'Utility Bills',
    amount: 850000,
    type: 'expense',
    category: 'Overhead',
    date: '24 Aug',
    status: 'Paid',
  },
];

export const GROWTH_DATA = [
  { month: 'MAY', value: 40 },
  { month: 'JUN', value: 70 },
  { month: 'JUL', value: 55 },
  { month: 'AUG', value: 95, isPeak: true },
  { month: 'SEP', value: 65 },
];
