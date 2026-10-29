import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, MapPin } from 'lucide-react-native';
import { CartContext } from '../../context/CartContext';
import Header from '../../components/common/Header';
import CartItem from '../../components/cart/CartItem';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import COLORS from '../../constants/colors';

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, subtotal, taxAndFees, grandTotal, clearCart } = useContext(CartContext);

  return (
    <View style={styles.container}>
      <Header title="My Cart" showCart={false} />

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your Cart is Empty"
          message="Looks like you haven't added any delicious food yet!"
          buttonTitle="Browse Menu"
          onButtonPress={() => router.push('/(tabs)/home')}
        />
      ) : (
        <View style={styles.content}>
          <View style={styles.clearHeader}>
            <Text style={styles.itemCountText}>
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} Selected
            </Text>
            <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
              <Trash2 size={16} color={COLORS.danger} />
              <Text style={styles.clearText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.cartKey}
            renderItem={({ item }) => <CartItem item={item} />}
            contentContainerStyle={styles.listContent}
          />

          {/* Pickup Counter Location Reminder */}
          <View style={styles.pickupBox}>
            <MapPin size={18} color={COLORS.primary} />
            <Text style={styles.pickupText}>
              Pickup Location: <Text style={styles.pickupBold}>Wrapchik SAC Counter</Text>
            </Text>
          </View>

          {/* Bill Summary Breakdown */}
          <View style={styles.billCard}>
            <Text style={styles.billTitle}>Bill Details</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Subtotal</Text>
              <Text style={styles.billValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Taxes & Campus Fee (5%)</Text>
              <Text style={styles.billValue}>₹{taxAndFees}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
            </View>

            <Button
              title={`Proceed to Checkout • ₹${grandTotal}`}
              onPress={() => router.push('/checkout')}
              style={styles.checkoutBtn}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  clearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  pickupBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginVertical: 8,
  },
  pickupText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  pickupBold: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  checkoutBtn: {
    marginTop: 14,
  },
});
