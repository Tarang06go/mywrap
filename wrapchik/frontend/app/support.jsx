import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Phone, Mail, MessageSquare, HelpCircle, ChevronRight } from 'lucide-react-native';
import Header from '../components/common/Header';
import COLORS from '../constants/colors';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse the menu on the Home tab, select your food item & customizations, add to cart, proceed to checkout, and complete online payment.',
  },
  {
    q: 'Where do I pickup my food order?',
    a: 'Collect your order from the Wrapchik Counter located at the SAC Ground Floor once your order status changes to "Ready for Pickup".',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support all online payment options via Razorpay including UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallets.',
  },
  {
    q: 'What if my payment fails?',
    a: 'If money was deducted during a failed transaction, Razorpay will automatically process a refund back to your payment account within 3–5 working days.',
  },
];

export default function SupportScreen() {
  const handleCall = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@wrapchik.com');
  };

  return (
    <View style={styles.container}>
      <Header title="Help & Support" showBack showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Contact Banner Cards */}
        <Text style={styles.sectionTitle}>Contact Shopkeeper</Text>

        <View style={styles.contactRow}>
          <TouchableOpacity onPress={handleCall} style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.successLight }]}>
              <Phone size={22} color={COLORS.success} />
            </View>
            <Text style={styles.contactTitle}>Call Shop</Text>
            <Text style={styles.contactVal}>+91 98765 43210</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEmail} style={styles.contactCard}>
            <View style={[styles.iconCircle, { backgroundColor: COLORS.infoLight }]}>
              <Mail size={22} color={COLORS.info} />
            </View>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactVal}>support@wrapchik.com</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {FAQS.map((faq, idx) => (
          <View key={idx} style={styles.faqCard}>
            <View style={styles.questionRow}>
              <HelpCircle size={18} color={COLORS.primary} />
              <Text style={styles.questionText}>{faq.q}</Text>
            </View>
            <Text style={styles.answerText}>{faq.a}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  contactVal: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  answerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginLeft: 26,
  },
});
