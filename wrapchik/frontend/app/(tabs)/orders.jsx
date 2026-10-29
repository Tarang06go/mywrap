import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CartContext } from '../../context/CartContext';
import Header from '../../components/common/Header';
import OrderCard from '../../components/order/OrderCard';
import Button from '../../components/common/Button';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import EmptyState from '../../components/common/EmptyState';
import orderService from '../../services/orderService';
import COLORS from '../../constants/colors';

export default function OrdersScreen() {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (e) {
      console.error('[OrdersScreen Error]:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleReorder = async (orderId) => {
    try {
      const res = await orderService.reorderFromPast(orderId);
      if (res.success) {
        const { reorderItems, unavailableItems } = res.data;
        reorderItems.forEach(item => {
          addToCart(item.product, item.customizations, item.quantity);
        });
        if (unavailableItems && unavailableItems.length > 0) {
          Alert.alert('Notice', 'Some items from your past order are currently unavailable and were not added to your cart.');
        } else {
          Alert.alert('Success', 'Items added to cart!');
        }
        router.push('/(tabs)/cart');
      } else {
        Alert.alert('Error', 'Failed to reorder.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred while reordering.');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') {
      return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.orderStatus);
    }
    if (filter === 'COMPLETED') {
      return ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(o.orderStatus);
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Header title="My Orders" showCart={false} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
          >
            <Text style={[styles.filterText, filter === tab && styles.filterTextActive]}>
              {tab === 'ALL' ? 'All Orders' : tab === 'ACTIVE' ? 'Live Orders' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <LoadingIndicator message="Loading your order history..." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          message="You haven't placed any food orders yet. Explore our delicious menu!"
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderCardWrapper}>
              <OrderCard order={item} />
              {['COMPLETED', 'DELIVERED'].includes(item.orderStatus) && (
                <View style={styles.reorderBtnContainer}>
                  <Button
                    title="Reorder"
                    onPress={() => handleReorder(item._id)}
                    style={styles.reorderBtn}
                  />
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  orderCardWrapper: {
    marginBottom: 16,
  },
  reorderBtnContainer: {
    marginTop: -20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  reorderBtn: {
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
