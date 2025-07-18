import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
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
import { AnimatedButton } from '../../components/AnimatedButton';
import { TransactionService } from '../../services/TransactionService';
import { Transaction, TransactionSummary } from '../../types/Transaction';
import { Spacing, Typography } from '../../constants/Colors';

export default function Dashboard() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  useEffect(() => {
    loadData();
    // Animate on load
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, [fadeAnim, slideAnim]);

  const loadData = async () => {
    try {
      const [transactionsData, summaryData] = await Promise.all([
        TransactionService.getTransactions(),
        TransactionService.getTransactionSummary(),
      ]);
      setTransactions(transactionsData.slice(0, 5)); // Show latest 5
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                Welcome back! 👋
              </Text>
              <Text style={[styles.title, { color: theme.text }]}>
                ZenSpndr
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Text style={[styles.themeToggleText, { color: theme.primary }]}>
                {isDark ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance Cards */}
          <View style={styles.balanceContainer}>
            <AnimatedCard 
              variant="elevated" 
              style={StyleSheet.flatten([styles.balanceCard, { backgroundColor: theme.primary }])}
            >
              <Text style={[styles.balanceLabel, { color: theme.white }]}>
                Total Balance
              </Text>
              <Text style={[styles.balanceAmount, { color: theme.white }]}>
                {formatCurrency(summary.balance)}
              </Text>
            </AnimatedCard>

            <View style={styles.summaryRow}>
              <AnimatedCard 
                variant="elevated" 
                style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginRight: Spacing.sm }])}
              >
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Income
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.secondary }]}>
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </AnimatedCard>

              <AnimatedCard 
                variant="elevated" 
                style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginLeft: Spacing.sm }])}
              >
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Expenses
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.error }]}>
                  {formatCurrency(summary.totalExpenses)}
                </Text>
              </AnimatedCard>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <AnimatedButton
              title="Add Income"
              onPress={() => router.push('/add-transaction?type=income')}
              variant="secondary"
              style={StyleSheet.flatten([styles.actionButton, { flex: 1, marginRight: Spacing.sm }])}
            />
            <AnimatedButton
              title="Add Expense"
              onPress={() => router.push('/add-transaction?type=expense')}
              variant="primary"
              style={StyleSheet.flatten([styles.actionButton, { flex: 1, marginLeft: Spacing.sm }])}
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Transactions
              </Text>
              <TouchableOpacity onPress={() => router.push('/transactions')}>
                <Text style={[styles.sectionLink, { color: theme.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {transactions.length === 0 ? (
              <AnimatedCard variant="outlined" style={styles.emptyState}>
                <Text style={[styles.emptyStateIcon, { color: theme.primary }]}>
                  💰
                </Text>
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  Start Your Financial Journey
                </Text>
                
                <View style={styles.emptyStateActions}>
                  <AnimatedButton
                    title="Add Your First Transaction"
                    onPress={() => router.push('/add-transaction')}
                    variant="primary"
                    style={styles.emptyStateButton}
                  />
                </View>
              </AnimatedCard>
            ) : (
              <View style={styles.transactionsList}>
                {transactions.map((transaction) => (
                  <AnimatedCard
                    key={transaction.id}
                    variant="outlined"
                    style={styles.transactionCard}
                    onPress={() => router.push('/transactions')}
                  >
                    <View style={styles.transactionRow}>
                      <View style={styles.transactionInfo}>
                        <Text style={[styles.transactionTitle, { color: theme.text }]}>
                          {transaction.title}
                        </Text>
                        <Text style={[styles.transactionCategory, { color: theme.textSecondary }]}>
                          {transaction.category} • {formatDate(transaction.date)}
                        </Text>
                      </View>
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
                    </View>
                  </AnimatedCard>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  greeting: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  themeToggle: {
    padding: Spacing.sm,
  },
  themeToggleText: {
    fontSize: Typography.fontSize.xl,
  },
  balanceContainer: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  balanceCard: {
    marginBottom: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryCard: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  actionButton: {
    paddingVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  sectionLink: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
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
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  emptyStateActions: {
    width: '100%',
    alignItems: 'center',
  },
  emptyStateButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionCard: {
    paddingVertical: Spacing.md,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  transactionAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
