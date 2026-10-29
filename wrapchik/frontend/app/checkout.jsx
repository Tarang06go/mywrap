import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, CreditCard, ShieldCheck } from 'lucide-react-native';
import { CartContext } from '../context/CartContext';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import orderService from '../services/orderService';
import settingsService from '../services/settingsService';
import tableService from '../services/tableService';
import FulfillmentSelector from '../components/checkout/FulfillmentSelector';
import HostelPicker from '../components/checkout/HostelPicker';
import TableSelector from '../components/checkout/TableSelector';
import COLORS from '../constants/colors';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, subtotal, taxAndFees, grandTotal, clearCart } = useContext(CartContext);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [settings, setSettings] = useState(null);
  const [tables, setTables] = useState([]);
  
  const [orderType, setOrderType] = useState('TAKEAWAY');
  const [hostel, setHostel] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COUNTER');
  const idempotencyKeyRef = useRef(`wrapchik-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (orderType === 'DINE_IN') {
      fetchTables();
    }
  }, [orderType]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const res = await settingsService.getSettings();
      if (res.success) {
        setSettings(res.settings);
      }
    } catch (e) {
      console.log('Error fetching settings', e);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await tableService.getAvailableTables();
      if (res.success) {
        setTables(res.tables || []);
      }
    } catch (e) {
      console.log('Error fetching tables', e);
    }
  };

  const deliveryFee = settings?.deliveryFee || 20;
  const displayTotal = orderType === 'DELIVERY' ? grandTotal + deliveryFee : grandTotal;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (orderType === 'DELIVERY' && (!hostel || !roomNumber)) {
        Alert.alert('Missing Details', 'Please select a hostel and enter room number.');
        return;
      }
      if (orderType === 'DINE_IN' && !selectedTableId) {
        Alert.alert('Missing Details', 'Please select an available table.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        orderType,
        idempotencyKey: idempotencyKeyRef.current,
      };

      if (orderType === 'DELIVERY') {
        orderPayload.hostel = hostel;
        orderPayload.roomNumber = roomNumber;
        orderPayload.deliveryInstructions = deliveryInstructions;
      } else if (orderType === 'DINE_IN') {
        orderPayload.tableId = selectedTableId;
      } else {
        orderPayload.pickupLocation = settings?.pickupLocation || 'Wrapchik Counter, SAC Ground Floor';
      }

      const res = await orderService.createOrder(orderPayload);

      if (res && res.success && res.order) {
        const orderData = res.order;
        
        if (paymentMethod === 'COUNTER') {
          router.replace({
            pathname: '/order-confirmation',
            params: {
              orderId: orderData._id,
              orderNumber: orderData.orderNumber,
              totalPaid: orderData.totalAmount,
              method: 'Pay at Counter (Cash)',
            },
          });
          setTimeout(() => {
            clearCart();
          }, 100);
        } else {
          router.push({
            pathname: '/payment',
            params: {
              orderId: orderData._id,
              amount: orderData.totalAmount,
              orderNumber: orderData.orderNumber,
            },
          });
        }
      } else {
        Alert.alert('Checkout Failed', res?.message || 'Unable to place order');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Checkout" showBack={false} showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator Header */}
        <View style={styles.stepHeader}>
          <View style={step >= 1 ? styles.stepActive : styles.stepInactive}>
            <Text style={step >= 1 ? styles.stepNum : styles.stepNumInactive}>1</Text>
            <Text style={step >= 1 ? styles.stepText : styles.stepTextInactive}>Mode</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={step >= 2 ? styles.stepActive : styles.stepInactive}>
            <Text style={step >= 2 ? styles.stepNum : styles.stepNumInactive}>2</Text>
            <Text style={step >= 2 ? styles.stepText : styles.stepTextInactive}>Details</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={step >= 3 ? styles.stepActive : styles.stepInactive}>
            <Text style={step >= 3 ? styles.stepNum : styles.stepNumInactive}>3</Text>
            <Text style={step >= 3 ? styles.stepText : styles.stepTextInactive}>Payment</Text>
          </View>
        </View>

        {dataLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {step === 1 && (
              <View>
                <Text style={styles.sectionTitle}>Select Fulfillment Mode</Text>
                <FulfillmentSelector 
                  selectedMode={orderType} 
                  onSelectMode={setOrderType} 
                  settings={settings} 
                />
              </View>
            )}

            {step === 2 && (
              <View>
                <Text style={styles.sectionTitle}>Fulfillment Details</Text>
                
                {orderType === 'DELIVERY' && (
                  <View>
                    <HostelPicker selectedHostel={hostel} onSelectHostel={setHostel} />
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Room Number</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. 204"
                        value={roomNumber}
                        onChangeText={setRoomNumber}
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Delivery Instructions (Optional)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Call upon reaching"
                        value={deliveryInstructions}
                        onChangeText={setDeliveryInstructions}
                      />
                    </View>
                  </View>
                )}

                {orderType === 'TAKEAWAY' && (
                  <View style={styles.fulfillmentCard}>
                    <View style={styles.fulfillmentHeader}>
                      <MapPin size={20} color={COLORS.primary} />
                      <Text style={styles.fulfillmentTitle}>Pickup Location</Text>
                    </View>
                    <Text style={styles.fulfillmentAddress}>
                      {settings?.pickupLocation || 'Wrapchik Counter, SAC Ground Floor'}
                    </Text>

                    <View style={styles.timeBadge}>
                      <Clock size={16} color={COLORS.warning} />
                      <Text style={styles.timeText}>
                        Estimated Prep: {settings?.estimatedPrepTime || '15-20 Mins'}
                      </Text>
                    </View>
                  </View>
                )}

                {orderType === 'DINE_IN' && (
                  <View>
                    <TableSelector 
                      tables={tables} 
                      selectedTableId={selectedTableId} 
                      onSelectTable={setSelectedTableId}
                      loading={false} 
                    />
                  </View>
                )}
              </View>
            )}

            {step === 3 && (
              <View>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryCard}>
                  {cartItems.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemQty}>{item.quantity}×</Text>
                      <View style={styles.itemNameBox}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.customizations?.length > 0 && (
                          <Text style={styles.itemCust}>
                            {item.customizations.map((c) => c.name).join(', ')}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.itemPrice}>₹{item.unitPrice * item.quantity}</Text>
                    </View>
                  ))}

                  <View style={styles.divider} />

                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Subtotal</Text>
                    <Text style={styles.costVal}>₹{subtotal}</Text>
                  </View>
                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>Taxes & Fees</Text>
                    <Text style={styles.costVal}>₹{taxAndFees}</Text>
                  </View>
                  
                  {orderType === 'DELIVERY' && (
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Delivery Fee</Text>
                      <Text style={styles.costVal}>₹{deliveryFee}</Text>
                    </View>
                  )}

                  <View style={styles.costRowTotal}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalVal}>₹{displayTotal}</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  <TouchableOpacity 
                    style={[styles.paymentCard, paymentMethod === 'COUNTER' && styles.paymentCardSelected]}
                    onPress={() => setPaymentMethod('COUNTER')}
                  >
                    <ShieldCheck size={24} color={paymentMethod === 'COUNTER' ? COLORS.primary : COLORS.textSecondary} />
                    <Text style={[styles.paymentText, paymentMethod === 'COUNTER' && styles.paymentTextSelected]}>Pay at Counter</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.paymentCard, paymentMethod === 'ONLINE' && styles.paymentCardSelected]}
                    onPress={() => setPaymentMethod('ONLINE')}
                  >
                    <CreditCard size={24} color={paymentMethod === 'ONLINE' ? COLORS.primary : COLORS.textSecondary} />
                    <Text style={[styles.paymentText, paymentMethod === 'ONLINE' && styles.paymentTextSelected]}>Pay Online</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <Button
            title="Back"
            variant="outline"
            onPress={handleBack}
            style={styles.actionBtn}
          />
          {step < 3 ? (
            <Button
              title="Next"
              onPress={handleNext}
              style={styles.actionBtn}
            />
          ) : (
            <Button
              title={`Place Order (₹${displayTotal})`}
              onPress={handlePlaceOrder}
              loading={loading}
              style={styles.actionBtn}
            />
          )}
        </View>
      </View>
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
    paddingBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.5,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepNumInactive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.border,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepTextInactive: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  fulfillmentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  fulfillmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fulfillmentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  fulfillmentAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.warning,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemQty: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 8,
  },
  itemNameBox: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemCust: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  costLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  costVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  costRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  paymentCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  paymentTextSelected: {
    color: COLORS.primary,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
});
