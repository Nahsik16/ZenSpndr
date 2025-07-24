export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Gifts & Donations',
  'Business',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Gift',
  'Other',
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#ff6b6b',
  'Transportation': '#4ecdc4',
  'Shopping': '#45b7d1',
  'Entertainment': '#96ceb4',
  'Bills & Utilities': '#feca57',
  'Healthcare': '#ff9ff3',
  'Education': '#54a0ff',
  'Travel': '#5f27cd',
  'Personal Care': '#00d2d3',
  'Home & Garden': '#ff9f43',
  'Gifts & Donations': '#ee5a24',
  'Business': '#0984e3',
  'Salary': '#00b894',
  'Freelance': '#6c5ce7',
  'Investment': '#a29bfe',
  'Rental': '#fd79a8',
  'Gift': '#fdcb6e',
  'Other': '#636e72',
};
