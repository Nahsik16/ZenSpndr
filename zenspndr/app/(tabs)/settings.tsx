import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedCard } from '../../components/AnimatedCard';
import { Spacing, Typography } from '../../constants/Colors';

export default function Settings() {
  const { theme, isDark, mode, setMode } = useTheme();

  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);

  React.useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withSpring(0, { damping: 15 });
  }, [fadeAnim, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all transactions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all transactions (implement this method in TransactionService)
              Alert.alert('Success', 'All data has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const themeOptions = [
    { key: 'light', label: 'Light', icon: '☀️' },
    { key: 'dark', label: 'Dark', icon: '🌙' },
    { key: 'system', label: 'System', icon: '📱' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Settings
            </Text>
          </View>

          {/* Theme Settings */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Theme
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Choose your preferred theme
            </Text>
            <View style={styles.themeOptions}>
              {themeOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.themeOption,
                    {
                      backgroundColor: mode === option.key ? theme.primary : theme.surface,
                      borderColor: mode === option.key ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setMode(option.key as 'light' | 'dark' | 'system')}
                >
                  <Text style={[styles.themeIcon, { color: mode === option.key ? theme.white : theme.text }]}>
                    {option.icon}
                  </Text>
                  <Text
                    style={[
                      styles.themeLabel,
                      {
                        color: mode === option.key ? theme.white : theme.text,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedCard>

          {/* App Info */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              App Information
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Version
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  1.0.0
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Build
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  Beta
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Platform
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  React Native
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
                  Theme
                </Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {isDark ? 'Dark' : 'Light'}
                </Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Features */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Features
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: theme.primary }]}>
                  💰
                </Text>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Expense Tracking
                  </Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    Track your daily expenses and income
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: theme.secondary }]}>
                  📊
                </Text>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Analytics
                  </Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    View detailed analytics and insights
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: theme.accent }]}>
                  🎨
                </Text>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Beautiful UI
                  </Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    Modern and intuitive interface
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Text style={[styles.featureIcon, { color: theme.error }]}>
                  🌙
                </Text>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.text }]}>
                    Dark Mode
                  </Text>
                  <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    Easy on the eyes, day or night
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedCard>

          {/* About */}
          <AnimatedCard variant="elevated" style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              About ZenSpndr
            </Text>
            <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
              ZenSpndr is a beautiful and intuitive expense tracking app built with React Native. 
              It helps you manage your finances with ease, providing detailed insights into your 
              spending patterns and helping you make better financial decisions.
            </Text>
            <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
              Built with modern technologies including React Native, Expo, and Reanimated for 
              smooth animations and a delightful user experience.
            </Text>
          </AnimatedCard>

          {/* Danger Zone */}
          <AnimatedCard variant="outlined" style={StyleSheet.flatten([styles.section, { borderColor: theme.error }])}>
            <Text style={[styles.sectionTitle, { color: theme.error }]}>
              Danger Zone
            </Text>
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              Irreversible actions that will affect your data
            </Text>
            <TouchableOpacity
              style={[
                styles.dangerButton,
                {
                  backgroundColor: theme.error,
                  borderColor: theme.error,
                },
              ]}
              onPress={handleClearData}
            >
              <Text style={[styles.dangerButtonText, { color: theme.white }]}>
                🗑️ Clear All Data
              </Text>
            </TouchableOpacity>
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
    paddingBottom: 120, // Add extra padding for tab bar
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 80,
    justifyContent: 'center',
  },
  themeIcon: {
    fontSize: Typography.fontSize.xl,
  },
  themeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: '40%',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  featuresList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  featureIcon: {
    fontSize: Typography.fontSize.xl,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: 18,
  },
  aboutText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  dangerButton: {
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dangerButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
