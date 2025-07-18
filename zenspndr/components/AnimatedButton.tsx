import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Spacing, Typography, Shadows } from '../constants/Colors';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
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
    scale.value = withSpring(0.95, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      paddingHorizontal: size === 'small' ? Spacing.sm : size === 'large' ? Spacing.xl : Spacing.md,
      paddingVertical: size === 'small' ? Spacing.xs : size === 'large' ? Spacing.md : Spacing.sm,
      minHeight: size === 'small' ? 36 : size === 'large' ? 52 : 44,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
      ...Shadows.sm,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: theme.transparent,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: theme.transparent,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? Typography.fontSize.sm : size === 'large' ? Typography.fontSize.lg : Typography.fontSize.md,
      fontWeight: Typography.fontWeight.semibold,
      marginLeft: icon && iconPosition === 'left' ? Spacing.xs : 0,
      marginRight: icon && iconPosition === 'right' ? Spacing.xs : 0,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: theme.white,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: theme.white,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: theme.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: theme.primary,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <AnimatedTouchableOpacity
      style={[getButtonStyle(), animatedStyle, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {icon && iconPosition === 'left' && icon}
      <Text style={[getTextStyle(), textStyle]}>{loading ? 'Loading...' : title}</Text>
      {icon && iconPosition === 'right' && icon}
    </AnimatedTouchableOpacity>
  );
};
