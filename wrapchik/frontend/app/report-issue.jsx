import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import api from '../services/api';
import COLORS from '../constants/colors';

const CATEGORIES = ['WRONG_ITEM', 'MISSING_ITEM', 'QUALITY', 'LATE', 'OTHER'];

export default function ReportIssueScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/issues', { orderId, category, description });
      if (res.success) {
        Alert.alert('Success', 'Issue reported successfully.');
        router.back();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to report issue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Report Issue" showBack showCart={false} />

      <View style={styles.content}>
        <Text style={styles.label}>Order ID: {orderId}</Text>
        
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBtn, category === cat && styles.activeCat]}
              onPress={() => setCategory(cat)}
            >
              <Text style={category === cat ? styles.activeCatText : styles.catText}>
                {cat.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholder="Describe the issue..."
        />

        <Button 
          title={submitting ? 'Submitting...' : 'Submit Issue'} 
          onPress={handleSubmit} 
          disabled={submitting} 
          style={{ marginTop: 24 }} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16 },
  label: { fontWeight: 'bold', marginBottom: 8, marginTop: 12, color: COLORS.textPrimary },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20 },
  activeCat: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { color: COLORS.textSecondary },
  activeCatText: { color: '#fff', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top'
  }
});
