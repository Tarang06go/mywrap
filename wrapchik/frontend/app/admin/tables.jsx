import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import tableService from '../../services/tableService';
import api from '../../services/api';
import COLORS from '../../constants/colors';

export default function AdminTablesScreen() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await tableService.getTables();
      if (res && res.tables) {
        setTables(res.tables);
      } else {
        setTables([]);
      }
    } catch (e) {
      console.error('[Admin Tables Fetch Error]:', e);
      setTables([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTables();
  };

  const toggleStatus = async (table) => {
    try {
      const newStatus = table.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
      // optimistic update
      setTables(prev => prev.map(t => t._id === table._id ? { ...t, status: newStatus } : t));
      await api.put(`/tables/${table._id}`, { status: newStatus });
    } catch (e) {
      console.error('[Toggle Table Status Error]:', e);
      Alert.alert('Error', 'Failed to update table status');
      fetchTables();
    }
  };

  const handleAddTable = () => {
    Alert.alert('Coming Soon', 'Table creation modal will be implemented here.');
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Loading tables..." />;
  }

  return (
    <View style={styles.container}>
      <Header title="Manage Tables" showBack showCart={false} />
      
      <View style={styles.headerActions}>
        <Button title="+ Add Table" onPress={handleAddTable} style={styles.addBtn} />
      </View>

      {tables.length === 0 ? (
        <EmptyState title="No Tables" message="No tables found. Add a table to get started." />
      ) : (
        <FlatList
          data={tables}
          keyExtractor={(item) => item._id || item.tableNumber.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          renderItem={({ item }) => (
            <View style={styles.tableCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.tableNumber}>Table {item.tableNumber}</Text>
                  <Text style={styles.tableInfo}>
                    {item.label || 'Standard Table'} • Capacity: {item.capacity || 4}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              
              <View style={styles.cardFooter}>
                <Button 
                  title={item.status === 'AVAILABLE' ? 'Mark Occupied' : 'Mark Available'} 
                  variant={item.status === 'AVAILABLE' ? 'primary' : 'outline'}
                  onPress={() => toggleStatus(item)}
                  style={styles.actionBtn}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerActions: { padding: 16, paddingBottom: 0 },
  addBtn: { width: 140, alignSelf: 'flex-end' },
  listContent: { padding: 16 },
  tableCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tableNumber: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary },
  tableInfo: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  cardFooter: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  actionBtn: { width: '100%', height: 40 },
});
