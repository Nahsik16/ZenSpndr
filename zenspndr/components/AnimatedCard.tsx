import React from 'react';
import { ViewStyle, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing, Shadows } from '../constants/Colors';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  animateOnPress?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
  animateOnPress = true,
}) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    if (animateOnPress && onPress) {
      scale.value = withSpring(0.98, { damping: 15 });
      opacity.value = withTiming(0.8, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (animateOnPress && onPress) {
      scale.value = withSpring(1, { damping: 15 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      backgroundColor: theme.surface,
    };

    const paddingValue = {
      none: 0,
      small: Spacing.sm,
      medium: Spacing.md,
      large: Spacing.lg,
    }[padding];

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...Shadows.md,
          padding: paddingValue,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.border,
          padding: paddingValue,
        };
      default:
        return {
          ...baseStyle,
          ...Shadows.sm,
          padding: paddingValue,
        };
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        <Animated.View style={[getCardStyle(), animatedStyle, style]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[getCardStyle(), animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};
