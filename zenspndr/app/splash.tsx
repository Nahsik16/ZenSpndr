import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LoadingPage from '../components/LoadingPage';

export default function SplashScreen() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingPage onLoadingComplete={handleLoadingComplete} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
