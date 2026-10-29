import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, ShoppingBag } from 'lucide-react-native';
import Button from '../components/common/Button';
import COLORS from '../constants/colors';

export default function OrderConfirmationScreen() {
  const { orderId, orderNumber, totalPaid, method } = useLocalSearchParams();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <CheckCircle2 size={64} color={COLORS.success} />
        </View>

        <Text style={styles.title}>Order Placed! 🎉</Text>
        <Text style={styles.subtitle}>
          Your order has been received by Wrapchik kitchen and is being prepared.
        </Text>

        <View style={styles.detailsBox}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>#{orderNumber || 'WRP-1023'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Paid</Text>
            <Text style={styles.valuePaid}>₹{totalPaid || '300'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{method || 'Online UPI'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Pickup Location</Text>
            <Text style={styles.value}>Wrapchik SAC Counter</Text>
          </View>
        </View>

        <Button
          title="Track Order Live"
          onPress={() => router.replace(`/order-tracking/${orderId || 'demo'}`)}
          style={styles.trackBtn}
        />

        <Button
          title="Back to Home"
          variant="outline"
          onPress={() => router.replace('/(tabs)/home')}
          style={styles.homeBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: COLORS.inputBackground,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  valuePaid: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.success,
  },
  trackBtn: {
    width: '100%',
    marginBottom: 10,
  },
  homeBtn: {
    width: '100%',
  },
});
