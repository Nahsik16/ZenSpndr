import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedTabBarIconProps {
  name: string;
  color: string;
  focused: boolean;
}

export default function AnimatedTabBarIcon({ name, color, focused }: AnimatedTabBarIconProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotateZ = useSharedValue(0);

  const iconMap: { [key: string]: string } = {
    home: '🏠',
    list: '📋',
    plus: '➕',
    'trending-up': '📈',
    settings: '⚙️',
  };

  useEffect(() => {
    if (focused) {
      // Scale and bounce animation when focused
      scale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1.1, { damping: 15, stiffness: 200 })
      );
      
      // Slight rotation for interactivity
      rotateZ.value = withSequence(
        withTiming(5, { duration: 100 }),
        withTiming(-5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      rotateZ.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0.7, { duration: 200 });
    }
  }, [focused, scale, rotateZ, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateZ: `${rotateZ.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        <Text style={[styles.icon, { color }]}>
          {iconMap[name] || '❓'}
        </Text>
      </Animated.View>
      {focused && (
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: color,
              opacity: opacity.value,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  icon: {
    fontSize: 24,
    textAlign: 'center',
  },
  indicator: {
    position: 'absolute',
    bottom: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
