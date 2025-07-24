import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, TransactionFormData, TransactionSummary, CategorySummary } from '../types/Transaction';
import { API_CONFIG, ApiResponse, createApiUrl } from '../constants/ApiConfig';

const STORAGE_KEY = '@transactions';
const USER_ID = 'user_1'; // Mock user ID

export class TransactionService {
  static async getTransactions(): Promise<Transaction[]> {
    try {
      // Debug: Log the API URL being used
      const apiUrl = createApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS);
      console.log('Fetching transactions from:', apiUrl);
      
      // Try to fetch from API first
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const result: ApiResponse<Transaction[]> = await response.json();
        console.log('API Response data:', result);
        if (result.success && result.data) {
          return result.data;
        }
      }

      // Fallback to local storage if API fails
      console.warn('API unavailable, falling back to local storage');
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      // Fallback to local storage
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
      } catch (localError) {
        console.error('Error loading from local storage:', localError);
        return [];
      }
    }
  }

  static async saveTransaction(formData: TransactionFormData): Promise<Transaction> {
    try {
      // Try to save to API first
      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: USER_ID,
          ...formData,
        }),
      });

      if (response.ok) {
        const result: ApiResponse<Transaction> = await response.json();
        if (result.success && result.data) {
          // Also save to local storage as backup
          await this.saveToLocalStorage(result.data);
          return result.data;
        }
      }

      // Fallback to local storage if API fails
      console.warn('API unavailable, saving to local storage');
      return await this.saveToLocalStorage({
        id: Date.now().toString(),
        user_id: USER_ID,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving transaction:', error);
      // Fallback to local storage
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        user_id: USER_ID,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return await this.saveToLocalStorage(newTransaction);
    }
  }

  private static async saveToLocalStorage(transaction: Transaction): Promise<Transaction> {
    const transactions = await this.getLocalTransactions();
    const existingIndex = transactions.findIndex(t => t.id === transaction.id);
    
    if (existingIndex >= 0) {
      transactions[existingIndex] = transaction;
    } else {
      transactions.push(transaction);
    }
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return transaction;
  }

  private static async getLocalTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading local transactions:', error);
      return [];
    }
  }

  static async updateTransaction(id: string, formData: TransactionFormData): Promise<Transaction> {
    try {
      // Try to update via API first
      const response = await fetch(createApiUrl(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result: ApiResponse<Transaction> = await response.json();
        if (result.success && result.data) {
          // Also update local storage
          await this.saveToLocalStorage(result.data);
          return result.data;
        }
      }

      // Fallback to local storage if API fails
      console.warn('API unavailable, updating local storage');
      const transactions = await this.getLocalTransactions();
      const index = transactions.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error('Transaction not found');
      }

      const updatedTransaction: Transaction = {
        ...transactions[index],
        ...formData,
        updated_at: new Date().toISOString(),
      };

      await this.saveToLocalStorage(updatedTransaction);
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      // Try to delete via API first
      const response = await fetch(createApiUrl(`${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Also remove from local storage
        await this.deleteFromLocalStorage(id);
        return;
      }

      // Fallback to local storage if API fails
      console.warn('API unavailable, deleting from local storage');
      await this.deleteFromLocalStorage(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Fallback to local storage
      await this.deleteFromLocalStorage(id);
    }
  }

  private static async deleteFromLocalStorage(id: string): Promise<void> {
    try {
      const transactions = await this.getLocalTransactions();
      const filteredTransactions = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error deleting from local storage:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      // Try to clear via API first
      const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Also clear local storage
        await AsyncStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Fallback to local storage if API fails
      console.warn('API unavailable, clearing local storage');
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all data:', error);
      // Fallback to local storage
      await AsyncStorage.removeItem(STORAGE_KEY);
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
