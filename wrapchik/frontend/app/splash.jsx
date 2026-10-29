import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import COLORS from '../constants/colors';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        if (user.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoIcon}>🌯</Text>
      </View>

      <Text style={styles.brandTitle}>WRAPCHIK</Text>
      <Text style={styles.tagline}>Fresh. Fast. Flavorful.</Text>
      <Text style={styles.subtext}>Campus Food Ordering Platform</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 54,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  subtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
