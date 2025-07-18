import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionFormData, TransactionSummary, CategorySummary } from '../types/Transaction';

const STORAGE_KEY = '@transactions';
const USER_ID = 'user_1'; // Mock user ID

export class TransactionService {
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  static async saveTransaction(formData: TransactionFormData): Promise<Transaction> {
    try {
      const transactions = await this.getTransactions();
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        user_id: USER_ID,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      transactions.push(newTransaction);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  static async updateTransaction(id: string, formData: TransactionFormData): Promise<Transaction> {
    try {
      const transactions = await this.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Transaction not found');
      }

      const updatedTransaction: Transaction = {
        ...transactions[index],
        ...formData,
        updated_at: new Date().toISOString(),
      };

      transactions[index] = updatedTransaction;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filteredTransactions = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  static async getTransactionSummary(): Promise<TransactionSummary> {
    try {
      const transactions = await this.getTransactions();
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactionCount: transactions.length,
      };
    } catch (error) {
      console.error('Error calculating summary:', error);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
      };
    }
  }

  static async getCategorySummary(): Promise<CategorySummary[]> {
    try {
      const transactions = await this.getTransactions();
      const categoryMap = new Map<string, number>();
      
      transactions.forEach(transaction => {
        const current = categoryMap.get(transaction.category) || 0;
        categoryMap.set(transaction.category, current + transaction.amount);
      });

      const total = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
      
      return Array.from(categoryMap.entries()).map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: this.getCategoryColor(category),
      }));
    } catch (error) {
      console.error('Error calculating category summary:', error);
      return [];
    }
  }

  private static getCategoryColor(category: string): string {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
      '#ee5a24', '#0984e3', '#00b894', '#6c5ce7', '#a29bfe',
      '#fd79a8', '#fdcb6e', '#636e72',
    ];
    const index = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }
}
