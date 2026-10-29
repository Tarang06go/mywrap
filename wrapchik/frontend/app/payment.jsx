import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Smartphone, CreditCard, Landmark, Wallet, ShieldCheck, LockKeyhole } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import paymentService from '../services/paymentService';
import COLORS from '../constants/colors';

const PAYMENT_METHODS = [
  { id: 'UPI', name: 'UPI', icon: Smartphone, desc: 'GPay • PhonePe • Paytm' },
  { id: 'CARD', name: 'Cards', icon: CreditCard, desc: 'Credit / Debit' },
  { id: 'NETBANKING', name: 'Net Banking', icon: Landmark, desc: 'All major banks' },
  { id: 'WALLET', name: 'Wallets', icon: Wallet, desc: 'Supported wallets' },
];

export default function PaymentScreen() {
  const { orderId, amount, orderNumber } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);

  const handlePayNow = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Mobile checkout required', 'Razorpay native checkout is configured for the Android/iOS app. Build a native development/release app to test payments.');
      return;
    }

    setProcessing(true);
    try {
      const createRes = await paymentService.createRazorpayOrder(orderId);
      const gatewayOrder = createRes?.razorpayOrder;
      if (!gatewayOrder?.id || !gatewayOrder?.key) throw new Error('Payment session could not be created');

      // react-native-razorpay uses native Android/iOS checkout.
      // eslint-disable-next-line global-require
      const RazorpayCheckout = require('react-native-razorpay').default || require('react-native-razorpay');
      const checkoutOptions = {
        description: `Wrapchik order #${orderNumber}`,
        image: 'https://cdn.razorpay.com/logos/razorpay.png',
        currency: gatewayOrder.currency || 'INR',
        key: gatewayOrder.key,
        amount: String(gatewayOrder.amount),
        name: 'Wrapchik',
        order_id: gatewayOrder.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: COLORS.primary },
        retry: { enabled: true, max_count: 2 },
      };

      const paymentData = await RazorpayCheckout.open(checkoutOptions);

      const verifyRes = await paymentService.verifyPayment({
        orderId,
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        method: paymentData.method || selectedMethod,
      });

      if (!verifyRes?.success) throw new Error(verifyRes?.message || 'Payment verification failed');

      clearCart();
      router.replace({
        pathname: '/order-confirmation',
        params: {
          orderId,
          orderNumber: verifyRes.orderNumber || orderNumber,
          totalPaid: amount,
          method: paymentData.method || selectedMethod,
        },
      });
    } catch (e) {
      if (String(e?.code) === '2' || /cancel/i.test(e?.description || e?.message || '')) {
        Alert.alert('Payment cancelled', 'Your order is saved. You can try the payment again.');
      } else {
        Alert.alert('Payment failed', e?.description || e?.message || 'Please try again.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Secure Payment" showBack showCart={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>TOTAL TO PAY</Text>
          <Text style={styles.amountValue}>₹{amount || '0'}</Text>
          <Text style={styles.orderRef}>Order #{orderNumber}</Text>
          <View style={styles.securePill}><LockKeyhole size={13} color="#FFF" /><Text style={styles.secureText}>Secure checkout</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Choose a preferred method</Text>
        <Text style={styles.sectionSub}>Razorpay may show additional methods based on your account.</Text>
        <View style={styles.grid}>
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const active = selectedMethod === method.id;
            return (
              <TouchableOpacity key={method.id} onPress={() => setSelectedMethod(method.id)} style={[styles.methodCard, active && styles.methodActive]} activeOpacity={0.85}>
                <View style={[styles.methodIcon, active && styles.methodIconActive]}><Icon size={21} color={active ? COLORS.primary : COLORS.textSecondary} /></View>
                <Text style={[styles.methodName, active && styles.methodNameActive]}>{method.name}</Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.securityBox}>
          <ShieldCheck size={20} color={COLORS.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Payment secured by Razorpay</Text>
            <Text style={styles.securityText}>Card/UPI details are handled by the payment gateway. Wrapchik only receives the payment result.</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={processing ? 'Opening secure checkout…' : `Pay ₹${amount || '0'}`} onPress={handlePayNow} loading={processing} style={styles.payBtn} />
        <Text style={styles.footerNote}>You will confirm the payment inside Razorpay.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 30 },
  amountCard: { backgroundColor: COLORS.primary, borderRadius: 22, padding: 22, alignItems: 'center', marginBottom: 22, elevation: 4 },
  amountLabel: { color: '#FFE5D8', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  amountValue: { color: '#FFF', fontSize: 38, fontWeight: '900', marginTop: 3 },
  orderRef: { color: '#FFF', fontSize: 12, opacity: 0.9, marginTop: 3 },
  securePill: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  secureText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
  sectionSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  methodCard: { width: '48%', minHeight: 105, backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1.5, borderColor: COLORS.border, padding: 12 },
  methodActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  methodIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.inputBackground, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  methodIconActive: { backgroundColor: '#FFF' },
  methodName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  methodNameActive: { color: COLORS.primary },
  methodDesc: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  securityBox: { flexDirection: 'row', gap: 10, backgroundColor: COLORS.successLight, padding: 13, borderRadius: 14, marginTop: 18 },
  securityTitle: { fontSize: 12, fontWeight: '900', color: COLORS.textPrimary },
  securityText: { fontSize: 11, lineHeight: 16, color: COLORS.textSecondary, marginTop: 2 },
  footer: { backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: COLORS.border, padding: 16 },
  payBtn: { width: '100%' },
  footerNote: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 10, marginTop: 8 },
});
