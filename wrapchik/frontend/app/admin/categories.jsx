import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { Plus, Trash2, Edit2 } from 'lucide-react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import categoryService from '../../services/categoryService';
import COLORS from '../../constants/colors';

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getCategories();
      if (res && res.categories) {
        setCategories(res.categories);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error('[Admin Categories Fetch Error]:', e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setImageUrl('');
    setModalVisible(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setImageUrl(cat.imageUrl || '');
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!name) {
      Alert.alert('Validation Error', 'Category name is required');
      return;
    }

    const payload = {
      name,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
      displayOrder: categories.length + 1,
    };

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, payload).catch(() => null);
      } else {
        await categoryService.createCategory(payload).catch(() => null);
      }
      
      fetchCategories();
      setModalVisible(false);
      setName('');
      setImageUrl('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteCategory = (id) => {
    if (typeof window !== 'undefined') {
      if (confirm('Are you sure you want to delete this category?')) {
        setCategories((prev) => prev.filter((c) => c._id !== id));
        if (id && !id.startsWith('cat')) {
          categoryService.deleteCategory(id).catch(() => null);
        }
      }
    } else {
      Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setCategories((prev) => prev.filter((c) => c._id !== id));
            if (id && !id.startsWith('cat')) {
              await categoryService.deleteCategory(id).catch(() => null);
            }
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Categories" showBack showCart={false} />

      <View style={styles.topBar}>
        <Text style={styles.countText}>{categories.length} Categories</Text>
        <Button title="+ Add Category" onPress={openAddModal} style={styles.addBtn} />
      </View>

      {loading ? (
        <LoadingIndicator message="Fetching categories..." />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.catCard}>
              <Text style={styles.catName}>{item.name}</Text>
              <View style={{flexDirection: 'row', gap: 12}}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.deleteBtn}>
                  <Edit2 size={18} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCategory(item._id)} style={styles.deleteBtn}>
                  <Trash2 size={18} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Category' : 'Add Category'}</Text>
            <Input label="Category Name" value={name} onChangeText={setName} placeholder="e.g. Desserts" />
            <Input label="Image URL" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setModalVisible(false)} style={styles.modalBtn} />
              <Button title={editingId ? 'Save Changes' : 'Save Category'} onPress={handleSaveCategory} style={styles.modalBtn} />
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
  },
  catCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  catName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  modalBtn: {
    flex: 1,
  },
});
