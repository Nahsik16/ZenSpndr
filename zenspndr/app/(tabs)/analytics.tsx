import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedCard } from '../../components/AnimatedCard';
import { TransactionService } from '../../services/TransactionService';
import { Transaction, TransactionSummary, CategorySummary } from '../../types/Transaction';
import { Spacing, Typography } from '../../constants/Colors';

export default function Analytics() {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  const loadData = useCallback(async () => {
    try {
      const [transactionsData, summaryData, categoryData] = await Promise.all([
        TransactionService.getTransactions(),
        TransactionService.getTransactionSummary(),
        TransactionService.getCategorySummary(),
      ]);
      
      setTransactions(transactionsData);
      setSummary(summaryData);
      setCategorySummary(categoryData.slice(0, 5)); // Top 5 categories
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Trigger animations after component mounts
    setTimeout(() => {
      fadeAnim.value = withTiming(1, { duration: 800 });
      slideAnim.value = withSpring(0, { damping: 15 });
    }, 0);
  }, [loadData, fadeAnim, slideAnim]);

  // Refresh analytics when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    } catch {
      // Fallback for currency formatting errors
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const getMonthlyData = () => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });

    const monthlyEntries = Object.entries(monthlyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6); // Last 6 months

    // Find the maximum value across all months for proper scaling
    const maxMonthlyValue = Math.max(
      ...monthlyEntries.flatMap(([, data]) => [data.income, data.expense]),
      1 // Ensure minimum value of 1 to avoid division by zero
    );

    return { monthlyEntries, maxMonthlyValue };
  };

  const { monthlyEntries: monthlyData, maxMonthlyValue } = getMonthlyData();

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
            <Text style={[styles.title, { color: theme.text }]}>
              Analytics
            </Text>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <AnimatedCard variant="elevated" style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginRight: Spacing.sm }])}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Income
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.secondary }]}>
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </AnimatedCard>
              
              <AnimatedCard variant="elevated" style={StyleSheet.flatten([styles.summaryCard, { flex: 1, marginLeft: Spacing.sm }])}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Expenses
                </Text>
                <Text style={[styles.summaryAmount, { color: theme.error }]}>
                  {formatCurrency(summary.totalExpenses)}
                </Text>
              </AnimatedCard>
            </View>

            <AnimatedCard variant="elevated" style={StyleSheet.flatten([styles.balanceCard, { backgroundColor: theme.primary }])}>
              <Text style={[styles.balanceLabel, { color: theme.white }]}>
                Net Balance
              </Text>
              <Text style={[styles.balanceAmount, { color: theme.white }]}>
                {formatCurrency(summary.balance)}
              </Text>
            </AnimatedCard>
          </View>

          {/* Monthly Trend */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Monthly Trend (Amount)
            </Text>
            <View style={styles.chartContainer}>
              {monthlyData.map(([month, data], index) => {
                // Calculate dynamic bar width based on actual screen width
                const screenWidth = Dimensions.get('window').width;
                const containerPadding = 32; // Total horizontal padding (16 * 2)
                const chartMargin = 16; // Chart container margins
                const monthGap = 4; // Gap between month columns
                const totalGaps = (monthlyData.length - 1) * monthGap;
                const availableWidth = screenWidth - containerPadding - chartMargin - totalGaps;
                const monthColumnWidth = availableWidth / monthlyData.length;
                const barWidth = Math.max(8, Math.min(20, (monthColumnWidth - 12) / 2)); // Width per bar
                
                return (
                  <View key={month} style={[styles.monthColumn, { 
                    flex: 1,
                    marginHorizontal: monthGap / 2,
                  }]}>
                    <View style={styles.bars}>
                      <View style={styles.barGroup}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(12, (data.income / maxMonthlyValue) * 120),
                              backgroundColor: theme.secondary,
                              width: barWidth,
                            },
                          ]}
                        />
                        <Text style={[styles.barValue, { color: theme.textSecondary, fontSize: Math.min(10, barWidth / 1.5) }]}>
                          {data.income > 0 ? `₹${(data.income / 1000).toFixed(0)}k` : '₹0'}
                        </Text>
                      </View>
                      <View style={styles.barGroup}>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: Math.max(12, (data.expense / maxMonthlyValue) * 120),
                              backgroundColor: theme.error,
                              width: barWidth,
                            },
                          ]}
                        />
                        <Text style={[styles.barValue, { color: theme.textSecondary, fontSize: Math.min(10, barWidth / 1.5) }]}>
                          {data.expense > 0 ? `₹${(data.expense / 1000).toFixed(0)}k` : '₹0'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.monthLabel, { color: theme.textSecondary, fontSize: Math.min(12, barWidth) }]}>
                      {month}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: theme.secondary }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                  Income
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: theme.error }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                  Expenses
                </Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Category Breakdown */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Top Categories
            </Text>
            {categorySummary.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No category data available
              </Text>
            ) : (
              <View style={styles.categoryList}>
                {categorySummary.map((category) => (
                  <View key={category.category} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View
                        style={[
                          styles.categoryColor,
                          { backgroundColor: category.color },
                        ]}
                      />
                      <Text style={[styles.categoryName, { color: theme.text }]}>
                        {category.category}
                      </Text>
                    </View>
                    <View style={styles.categoryStats}>
                      <Text style={[styles.categoryAmount, { color: theme.text }]}>
                        {formatCurrency(category.amount)}
                      </Text>
                      <Text style={[styles.categoryPercentage, { color: theme.textSecondary }]}>
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </AnimatedCard>

          {/* Quick Stats */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Stats
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {summary.transactionCount}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total Transactions
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.secondary }]}>
                  {transactions.filter(t => t.type === 'income').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Income Transactions
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.error }]}>
                  {transactions.filter(t => t.type === 'expense').length}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Expense Transactions
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.accent }]}>
                  {summary.totalExpenses > 0 ? 
                    formatCurrency(summary.totalExpenses / transactions.filter(t => t.type === 'expense').length) : 
                    '₹0.00'
                  }
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Avg. Expense
                </Text>
              </View>
            </View>
          </AnimatedCard>
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
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryContainer: {
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
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
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  balanceCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
    overflow: 'hidden',
  },
  monthColumn: {
    alignItems: 'center',
    minWidth: 40,
    maxWidth: 80,
  },
  monthLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 3,
    justifyContent: 'center',
  },
  barGroup: {
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    minHeight: 8,
    borderRadius: 4,
    // width will be set dynamically in the component
  },
  barValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryList: {
    gap: Spacing.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryPercentage: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
