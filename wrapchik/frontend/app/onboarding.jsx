import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import COLORS from '../constants/colors';
import Button from '../components/common/Button';

const SLIDES = [
  {
    icon: '🌯',
    title: 'Delicious Food, Order Easily',
    desc: 'Browse fresh wraps, burgers, fries, and cold coffee right from your phone.',
  },
  {
    icon: '⚡',
    title: 'Skip the Counter Queue',
    desc: 'No more waiting in long lines at the campus shop. Place your order digitally in seconds.',
  },
  {
    icon: '📍',
    title: 'Live Tracking & Instant Pickup',
    desc: 'Track your order status in real time and pick up your hot food as soon as it is ready.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[currentSlide];

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>{slide.icon}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'space-between',
  },
  skipBtn: {
    alignSelf: 'flex-end',
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 70,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  nextBtn: {
    width: '100%',
  },
});
