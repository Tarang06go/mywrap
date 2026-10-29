import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const LoadingIndicator = ({ message = 'Loading fresh items...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default LoadingIndicator;
