import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Typography } from '../constants/Colors';

const { width } = Dimensions.get('window');

interface LoadingPageProps {
  onLoadingComplete?: () => void;
}

export default function LoadingPage({ onLoadingComplete }: LoadingPageProps) {
  const { theme } = useTheme();
  
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(50);
  const progressWidth = useSharedValue(0);
  const tickOpacity = useSharedValue(0);
  const tickScale = useSharedValue(0);
  const checkmarkPath = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  // Create dot animations
  const dot0Opacity = useSharedValue(0.3);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Opacity = useSharedValue(0.3);
  
  // Feature card animations
  const feature1Scale = useSharedValue(0);
  const feature2Scale = useSharedValue(0);
  const feature3Scale = useSharedValue(0);
  const feature4Scale = useSharedValue(0);
  
  const dotsOpacity = useMemo(() => [
    dot0Opacity,
    dot1Opacity,
    dot2Opacity,
  ], [dot0Opacity, dot1Opacity, dot2Opacity]);

  useEffect(() => {
    const startLoadingAnimation = () => {
      // Logo animation
      logoScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      logoOpacity.value = withTiming(1, { duration: 800 });
      
      // Text animation (delayed)
      setTimeout(() => {
        textOpacity.value = withTiming(1, { duration: 600 });
        textTranslateY.value = withSpring(0, { damping: 15 });
      }, 500);
      
      // Progress bar animation
      setTimeout(() => {
        progressWidth.value = withTiming(100, { duration: 2000 });
      }, 1000);
      
      // Tick animation (fast and satisfying)
      setTimeout(() => {
        tickOpacity.value = withTiming(1, { duration: 150 });
        tickScale.value = withSequence(
          withSpring(1.2, { damping: 8, stiffness: 400 }),
          withSpring(1, { damping: 12, stiffness: 300 })
        );
        checkmarkPath.value = withTiming(1, { duration: 300 });
      }, 1200);
      
      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1
      );
      
      // Dots animation
      dotsOpacity.forEach((dot, index) => {
        setTimeout(() => {
          dot.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 300 }),
              withTiming(0.3, { duration: 300 })
            ),
            -1
          );
        }, index * 200);
      });
      
      // Feature cards animation (staggered)
      setTimeout(() => {
        feature1Scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }, 1500);
      setTimeout(() => {
        feature2Scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }, 1650);
      setTimeout(() => {
        feature3Scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }, 1800);
      setTimeout(() => {
        feature4Scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }, 1950);
      
      // Complete loading after 3 seconds
      setTimeout(() => {
        if (onLoadingComplete) {
          runOnJS(onLoadingComplete)();
        }
      }, 3000);
    };

    startLoadingAnimation();
  }, [onLoadingComplete, logoScale, logoOpacity, textOpacity, textTranslateY, progressWidth, tickOpacity, tickScale, checkmarkPath, pulseScale, dotsOpacity, feature1Scale, feature2Scale, feature3Scale, feature4Scale]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { scale: pulseScale.value },
      ],
      opacity: logoOpacity.value,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [{ translateY: textTranslateY.value }],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const tickAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: tickOpacity.value,
      transform: [{ scale: tickScale.value }],
    };
  });

  const dot0Style = useAnimatedStyle(() => ({
    opacity: dotsOpacity[0].value,
  }));

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dotsOpacity[1].value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dotsOpacity[2].value,
  }));

  const feature1Style = useAnimatedStyle(() => ({
    transform: [{ scale: feature1Scale.value }],
  }));

  const feature2Style = useAnimatedStyle(() => ({
    transform: [{ scale: feature2Scale.value }],
  }));

  const feature3Style = useAnimatedStyle(() => ({
    transform: [{ scale: feature3Scale.value }],
  }));

  const feature4Style = useAnimatedStyle(() => ({
    transform: [{ scale: feature4Scale.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={[styles.logoBackground, { backgroundColor: theme.primary }]}>
            <Text style={[styles.logoText, { color: theme.white }]}>
              💰
            </Text>
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={[styles.titleContainer, textAnimatedStyle]}>
          <Text style={[styles.title, { color: theme.text }]}>
            ZenSpndr
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Smart Expense Tracking
          </Text>
        </Animated.View>

        {/* Loading Animation */}
        <View style={styles.loadingContainer}>
          {/* Tick Animation */}
          {/* <Animated.View style={[styles.tickContainer, tickAnimatedStyle]}>
            <View style={[styles.tickBackground, { backgroundColor: theme.success }]}>
              <Text style={[styles.tickIcon, { color: theme.white }]}>✓</Text>
            </View>
          </Animated.View> */}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.primary },
                  progressAnimatedStyle,
                ]}
              />
            </View>
          </View>

          {/* Loading Text with Dots */}
          <View style={styles.loadingTextContainer}>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading
            </Text>
            {dotsOpacity.map((_, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.loadingDot,
                  { color: theme.textSecondary },
                  index === 0 ? dot0Style : index === 1 ? dot1Style : dot2Style,
                ]}
              >
                .
              </Animated.Text>
            ))}
          </View>
        </View>

        {/* Feature Highlights */}
        <Animated.View style={[styles.featuresContainer, textAnimatedStyle]}>
          <View style={styles.featureRow}>
            <Animated.View style={[styles.feature, { backgroundColor: theme.surface }, feature1Style]}>
              <Text style={[styles.featureIcon, { color: theme.primary }]}>📊</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Track & Analyze
              </Text>
            </Animated.View>
            <Animated.View style={[styles.feature, { backgroundColor: theme.surface }, feature2Style]}>
              <Text style={[styles.featureIcon, { color: theme.secondary }]}>🎯</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Smart Budgeting
              </Text>
            </Animated.View>
          </View>
          <View style={styles.featureRow}>
            <Animated.View style={[styles.feature, { backgroundColor: theme.surface }, feature3Style]}>
              <Text style={[styles.featureIcon, { color: theme.accent }]}>📱</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Beautiful UI
              </Text>
            </Animated.View>
            <Animated.View style={[styles.feature, { backgroundColor: theme.surface }, feature4Style]}>
              <Text style={[styles.featureIcon, { color: theme.success }]}>🔒</Text>
              <Text style={[styles.featureText, { color: theme.text }]}>
                Secure Data
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: '30%', // Keep logo 15% from top
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  logoText: {
    fontSize: 48,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  tickContainer: {
    marginBottom: Spacing.lg,
  },
  tickBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tickIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressContainer: {
    width: width * 0.6,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  loadingDot: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: 2,
  },
  featuresContainer: {
    width: '100%',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: 12,
    minHeight: 85,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  featureText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    lineHeight: 14,
    color: 'inherit',
  },
});
