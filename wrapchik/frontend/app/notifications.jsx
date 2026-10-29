import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/common/Header';
import EmptyState from '../components/common/EmptyState';
import LoadingIndicator from '../components/common/LoadingIndicator';
import notificationService from '../services/notificationService';
import COLORS from '../constants/colors';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications();
      if (res.success) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id, notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(id);
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      } catch (e) {
        console.error(e);
      }
    }
    
    if (notification.type === 'ORDER_UPDATE' && notification.metadata?.orderId) {
      router.push(`/order-tracking/${notification.metadata.orderId}`);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Notifications" showBack showCart={false} />
      
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <LoadingIndicator message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications"
          message="You are all caught up!"
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
              onPress={() => markAsRead(item._id, item)}
            >
              {!item.isRead && <View style={styles.unreadDot} />}
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  markAllBtn: { padding: 16, alignItems: 'flex-end' },
  markAllText: { color: COLORS.primary, fontWeight: 'bold' },
  list: { padding: 16 },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unreadCard: {
    backgroundColor: '#F0F8FF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 12,
  },
  content: { flex: 1 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  message: { color: COLORS.textSecondary, marginBottom: 8 },
  time: { fontSize: 12, color: '#aaa' },
});
