import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Header from '../../components/common/Header';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import orderService from '../../services/orderService';
import { SocketContext } from '../../context/SocketContext';
import COLORS from '../../constants/colors';

const DEMO_TRACKING_ORDER = {
  _id: 'demo',
  orderNumber: 'WRP-1023',
  orderStatus: 'PREPARING',
  paymentStatus: 'SUCCESS',
  createdAt: new Date().toISOString(),
  pickupLocation: 'Wrapchik Counter, SAC Ground Floor',
  totalAmount: 300,
  items: [
    { name: 'Paneer Tikka Wrap', quantity: 2, priceAtPurchase: 120 },
    { name: 'Cold Coffee with Ice Cream', quantity: 1, priceAtPurchase: 60 },
  ],
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const { socket } = React.useContext(SocketContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (data.orderId === id || data.orderId === order?._id) {
        fetchOrderDetails();
      }
    };
    socket.on('order_updated', handler);
    return () => socket.off('order_updated', handler);
  }, [socket, id, order?._id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrderById(id);
      if (res && res.order) {
        setOrder(res.order);
      } else {
        setOrder(null);
      }
    } catch (e) {
      console.error('[Order Tracking Fetch Error]:', e);
      setOrder(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await orderService.cancelOrder(order._id);
            if (res.success) {
              Alert.alert('Cancelled', 'Your order has been cancelled.');
              fetchOrderDetails();
            }
          } catch (e) {
            Alert.alert('Cancellation Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Fetching order status..." />;
  }

  return (
    <View style={styles.container}>
      <Header title={`Order #${order?.orderNumber || '1023'}`} showBack showCart={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header Status Card */}
        <View style={styles.statusHeaderCard}>
          <View>
            <Text style={styles.orderTitle}>Order #{order?.orderNumber}</Text>
            <Text style={styles.orderDate}>
              Placed on {new Date(order?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <StatusBadge status={order?.orderStatus} />
        </View>

        {/* Visual Stepper Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Live Order Tracker</Text>
          <OrderStatusTimeline currentStatus={order?.orderStatus || 'PLACED'} orderType={order?.orderType || 'TAKEAWAY'} />
        </View>

        {/* Order Items Breakdown */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Item Summary</Text>
          {order?.items?.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQty}>{item.quantity}×</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.priceAtPurchase * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount Paid</Text>
            <Text style={styles.totalVal}>₹{order?.totalAmount}</Text>
          </View>
        </View>

        {/* Pickup Counter Location Box */}
        <View style={styles.locationCard}>
          <Text style={styles.locationTitle}>📍 Pickup Location</Text>
          <Text style={styles.locationText}>{order?.pickupLocation || 'Wrapchik SAC Counter'}</Text>
        </View>

        {/* Cancel Button if status is PLACED */}
        {order?.orderStatus === 'PLACED' && (
          <Button
            title="Cancel Order"
            variant="danger"
            onPress={handleCancelOrder}
            style={styles.cancelBtn}
          />
        )}
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
  statusHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  locationCard: {
    backgroundColor: COLORS.primaryLight,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  cancelBtn: {
    marginTop: 8,
  },
});
