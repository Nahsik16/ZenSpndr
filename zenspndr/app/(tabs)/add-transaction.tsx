import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedCard } from '../../components/AnimatedCard';
import { AnimatedButton } from '../../components/AnimatedButton';
import { TransactionService } from '../../services/TransactionService';
import { TransactionFormData, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../types/Transaction';
import { Spacing, Typography, BorderRadius } from '../../constants/Colors';

export default function AddTransaction() {
  const { theme } = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    title: '',
    amount: 0,
    category: '',
    type: (type as 'income' | 'expense') || 'expense',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const slideAnim = useSharedValue(50);
  const fadeAnim = useSharedValue(0);

  React.useEffect(() => {
    fadeAnim.value = withSpring(1, { damping: 15 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, [fadeAnim, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const categories = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setIsLoading(true);
    
    try {
      const transactionData: TransactionFormData = {
        ...formData,
        category: selectedCategory,
        amount: parseFloat(formData.amount.toString()),
      };

      await TransactionService.saveTransaction(transactionData);
      
      Alert.alert('Success', 'Transaction added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setFormData(prev => ({ ...prev, type: newType }));
    setSelectedCategory('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backButton, { color: theme.primary }]}>
                ← Back
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>
              Add Transaction
            </Text>
            <View style={styles.spacer} />
          </View>

          {/* Type Selection */}
          <AnimatedCard variant="outlined" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Transaction Type
            </Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: formData.type === 'income' ? theme.secondary : theme.surface,
                    borderColor: formData.type === 'income' ? theme.secondary : theme.border,
                  },
                ]}
                onPress={() => handleTypeChange('income')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: formData.type === 'income' ? theme.white : theme.text,
                    },
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: formData.type === 'expense' ? theme.error : theme.surface,
                    borderColor: formData.type === 'expense' ? theme.error : theme.border,
                  },
                ]}
                onPress={() => handleTypeChange('expense')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color: formData.type === 'expense' ? theme.white : theme.text,
                    },
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>

          {/* Title Input */}
          <AnimatedCard variant="outlined" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Title
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Enter transaction title"
              placeholderTextColor={theme.textSecondary}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            />
          </AnimatedCard>

          {/* Amount Input */}
          <AnimatedCard variant="outlined" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Amount
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={formData.amount.toString()}
              onChangeText={(text) => setFormData(prev => ({ ...prev, amount: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
          </AnimatedCard>

          {/* Category Selection */}
          <AnimatedCard variant="outlined" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Category
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: selectedCategory === category ? theme.primary : theme.surface,
                      borderColor: selectedCategory === category ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: selectedCategory === category ? theme.white : theme.text,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          {/* Description Input */}
          <AnimatedCard variant="outlined" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Enter transaction description"
              placeholderTextColor={theme.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
          </AnimatedCard>

          {/* Submit Button */}
          <AnimatedButton
            title={isLoading ? 'Saving...' : 'Add Transaction'}
            onPress={handleSubmit}
            variant="primary"
            fullWidth
            disabled={isLoading}
            style={styles.submitButton}
          />
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
    marginBottom: Spacing.lg,
  },
  backButton: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  spacer: {
    width: 50,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  categoryButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
});
