import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import productService from '../../services/productService';
import COLORS from '../../constants/colors';

export default function AdminProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts();
      if (res && res.products) {
        setProducts(res.products);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.error('[Admin Products Fetch Error]:', e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id, currentVal) => {
    try {
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, available: !currentVal } : p))
      );
      await productService.toggleAvailability(id).catch(() => null);
    } catch (e) {
      console.error('[Toggle Availability Error]:', e);
    }
  };

  const handleDeleteProduct = (id) => {
    if (typeof window !== 'undefined') {
      if (confirm('Are you sure you want to delete this product from menu?')) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        if (id && !id.startsWith('p')) {
          productService.deleteProduct(id).catch(() => null);
        }
      }
    } else {
      Alert.alert('Delete Product', 'Are you sure you want to delete this product from menu?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setProducts((prev) => prev.filter((p) => p._id !== id));
            if (id && !id.startsWith('p')) {
              await productService.deleteProduct(id).catch(() => null);
            }
          },
        },
      ]);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600');
    setModalVisible(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id);
    setName(product.name);
    setPrice(product.price.toString());
    setDescription(product.description);
    setImageUrl(product.imageUrl);
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!name || !price || !description) {
      Alert.alert('Validation Error', 'Please fill in product name, price, and description');
      return;
    }

    const payload = {
      name,
      price: Number(price),
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
      categoryId: '65d1a2b3c4d5e6f7a8b9c0d1', // Placeholder default category
    };

    try {
      if (editingId) {
        await productService.updateProduct(editingId, payload).catch(() => null);
      } else {
        await productService.createProduct(payload).catch(() => null);
      }

      fetchProducts();
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Product Inventory" showBack showCart={false} />

      <View style={styles.topBar}>
        <Text style={styles.countText}>{products.length} Products listed</Text>
        <Button title="+ Add Product" onPress={openAddModal} style={styles.addBtn} />
      </View>

      {loading ? (
        <LoadingIndicator message="Loading menu inventory..." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.desc} numberOfLines={1}>
                  {item.description}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <View style={styles.switchRow}>
                  <Text style={[styles.switchLabel, item.available && styles.switchLabelActive]}>
                    {item.available ? 'AVAILABLE' : 'OFF'}
                  </Text>
                  <Switch
                    value={item.available !== false}
                    onValueChange={() => handleToggleAvailability(item._id, item.available)}
                    trackColor={{ false: '#767577', true: COLORS.primaryLight }}
                    thumbColor={item.available ? COLORS.primary : '#f4f3f4'}
                  />
                </View>

                <View style={{flexDirection: 'row', gap: 10, marginTop: 4}}>
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={styles.deleteBtn}
                  >
                    <Edit2 size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteProduct(item._id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add New Menu Item'}</Text>

            <ScrollView style={styles.formScroll}>
              <Input label="Product Name" value={name} onChangeText={setName} placeholder="e.g. Paneer Wrap" />
              <Input label="Price (₹)" value={price} onChangeText={setPrice} placeholder="e.g. 120" keyboardType="numeric" />
              <Input label="Description" value={description} onChangeText={setDescription} placeholder="Description of ingredients..." />
              <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
            </ScrollView>

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={styles.modalBtn} />
              <Button title={editingId ? "Save Changes" : "Save Product"} onPress={handleSaveProduct} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  addBtn: {
    height: 40,
    paddingHorizontal: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
    marginTop: 2,
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  switchLabelActive: {
    color: COLORS.primary,
  },
  deleteBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  formScroll: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtn: {
    flex: 1,
  },
});
