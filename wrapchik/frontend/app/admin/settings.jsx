import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import api from '../../services/api';
import COLORS from '../../constants/colors';

const ToggleSwitch = ({ value, onValueChange, label }) => (
  <View style={styles.toggleRow}>
    <Text style={styles.toggleLabel}>{label}</Text>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
      style={[styles.toggleContainer, value ? styles.toggleOn : styles.toggleOff]}
    >
      <View style={[styles.toggleCircle, value ? styles.circleOn : styles.circleOff]} />
    </TouchableOpacity>
  </View>
);

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res && res.settings) {
        setSettings(res.settings);
      }
    } catch (e) {
      console.error('[Admin Settings Fetch Error]:', e);
      Alert.alert('Error', 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings', settings);
      Alert.alert('Success', 'Settings updated successfully');
    } catch (e) {
      console.error('[Admin Settings Save Error]:', e);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading settings..." />;
  }

  if (!settings) {
    return (
      <View style={styles.container}>
        <Header title="Restaurant Settings" showBack showCart={false} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Failed to load settings.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Restaurant Settings" showBack showCart={false} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Toggles</Text>
          <ToggleSwitch 
            label="Accepting Orders" 
            value={settings.acceptingOrders} 
            onValueChange={(val) => setSettings({...settings, acceptingOrders: val})} 
          />
          <ToggleSwitch 
            label="Delivery Enabled" 
            value={settings.deliveryEnabled} 
            onValueChange={(val) => setSettings({...settings, deliveryEnabled: val})} 
          />
          <ToggleSwitch 
            label="Takeaway Enabled" 
            value={settings.takeawayEnabled} 
            onValueChange={(val) => setSettings({...settings, takeawayEnabled: val})} 
          />
          <ToggleSwitch 
            label="Dine-in Enabled" 
            value={settings.dineInEnabled} 
            onValueChange={(val) => setSettings({...settings, dineInEnabled: val})} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Info</Text>
          <Text style={styles.inputLabel}>Open Time</Text>
          <TextInput
            style={styles.input}
            value={settings.openTime}
            onChangeText={(val) => setSettings({...settings, openTime: val})}
            placeholder="e.g. 10:00 AM"
          />
          
          <Text style={styles.inputLabel}>Close Time</Text>
          <TextInput
            style={styles.input}
            value={settings.closeTime}
            onChangeText={(val) => setSettings({...settings, closeTime: val})}
            placeholder="e.g. 10:00 PM"
          />

          <Text style={styles.inputLabel}>Est. Prep Minutes</Text>
          <TextInput
            style={styles.input}
            value={settings.estimatedPrepMinutes?.toString()}
            onChangeText={(val) => setSettings({...settings, estimatedPrepMinutes: parseInt(val) || 0})}
            keyboardType="number-pad"
          />
          
          <Text style={styles.inputLabel}>Delivery Fee (₹)</Text>
          <TextInput
            style={styles.input}
            value={settings.deliveryFee?.toString()}
            onChangeText={(val) => setSettings({...settings, deliveryFee: parseInt(val) || 0})}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Busy Status</Text>
          <View style={styles.statusRow}>
            {['NORMAL', 'BUSY', 'VERY_BUSY'].map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => setSettings({...settings, busyStatus: status})}
                style={[styles.statusBtn, settings.busyStatus === status && styles.statusBtnActive]}
              >
                <Text style={[styles.statusBtnText, settings.busyStatus === status && styles.statusBtnTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button 
          title={saving ? "Saving..." : "Save Settings"} 
          onPress={handleSave} 
          disabled={saving}
          style={styles.saveBtn}
        />
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  
  // Toggle Styles
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  toggleLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600' },
  toggleContainer: { width: 50, height: 28, borderRadius: 14, justifyContent: 'center', paddingHorizontal: 2 },
  toggleOn: { backgroundColor: COLORS.success },
  toggleOff: { backgroundColor: COLORS.border },
  toggleCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF' },
  circleOn: { transform: [{ translateX: 22 }] },
  circleOff: { transform: [{ translateX: 0 }] },

  // Input Styles
  inputLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    color: COLORS.textPrimary,
  },

  // Busy Status Styles
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
  },
  statusBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  statusBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  statusBtnTextActive: { color: '#FFF' },

  saveBtn: { marginTop: 10 },
});
