import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedCard } from '../../components/AnimatedCard';
import { TransactionService } from '../../services/TransactionService';
import { Transaction } from '../../types/Transaction';
import { Spacing, Typography } from '../../constants/Colors';

export default function TransactionsList() {
  const { theme } = useTheme();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    loadTransactions();
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, [fadeAnim, slideAnim]);

  const loadTransactions = async () => {
    try {
      const data = await TransactionService.getTransactions();
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const deleteTransaction = async (id: string) => {
    try {
      await TransactionService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction');
    }
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${transaction.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(transaction.id) },
      ]
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Transactions
          </Text>
          <TouchableOpacity onPress={() => router.push('/add-transaction')}>
            <Text style={[styles.addButton, { color: theme.primary }]}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {['all', 'income', 'expense'].map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filter === filterType ? theme.primary : theme.surface,
                  borderColor: filter === filterType ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setFilter(filterType as 'all' | 'income' | 'expense')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: filter === filterType ? theme.white : theme.text,
                  },
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions List */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {filteredTransactions.length === 0 ? (
            <AnimatedCard variant="outlined" style={styles.emptyState}>
              <Text style={[styles.emptyStateIcon, { color: theme.primary }]}>
                {filter === 'all' ? '💰' : filter === 'income' ? '💵' : '💸'}
              </Text>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                {filter === 'all' 
                  ? 'No Transactions Yet'
                  : filter === 'income' 
                    ? 'No Income Transactions'
                    : 'No Expense Transactions'
                }
              </Text>
              <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                {filter === 'all' 
                  ? 'Start tracking your finances by adding your first transaction. Every financial journey begins with a single step.'
                  : filter === 'income'
                    ? 'No income transactions found. Add your salary, freelance work, or other income sources.'
                    : 'No expense transactions found. Track your spending to better understand your financial habits.'
                }
              </Text>
            </AnimatedCard>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((transaction) => (
                <AnimatedCard
                  key={transaction.id}
                  variant="outlined"
                  style={styles.transactionCard}
                  onPress={() => router.push('/transactions')}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionTitle, { color: theme.text }]}>
                        {transaction.title}
                      </Text>
                      <Text style={[styles.transactionCategory, { color: theme.textSecondary }]}>
                        {transaction.category}
                      </Text>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color: transaction.type === 'income' ? theme.secondary : theme.error,
                          },
                        ]}
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </Text>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteTransaction(transaction)}
                      >
                        <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                          🗑️
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.transactionMeta}>
                    <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
                      {formatDate(transaction.date)}
                    </Text>
                    {transaction.description && (
                      <Text style={[styles.transactionDescription, { color: theme.textSecondary }]}>
                        {transaction.description}
                      </Text>
                    )}
                  </View>
                </AnimatedCard>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  addButton: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.sm,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionCard: {
    paddingVertical: Spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  transactionCategory: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.md,
  },
  transactionMeta: {
    gap: Spacing.xs,
  },
  transactionDate: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
  },
  transactionDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    fontStyle: 'italic',
  },
});
