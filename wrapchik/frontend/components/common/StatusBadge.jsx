import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const STATUS_CONFIG = {
  PLACED: { label: 'Placed', bg: COLORS.infoLight, text: COLORS.info },
  ACCEPTED: { label: 'Accepted', bg: COLORS.warningLight, text: COLORS.warning },
  PREPARING: { label: 'Preparing', bg: COLORS.warningLight, text: COLORS.warning },
  READY: { label: 'Ready for Pickup', bg: COLORS.successLight, text: COLORS.success },
  COMPLETED: { label: 'Completed', bg: COLORS.successLight, text: COLORS.success },
  REJECTED: { label: 'Rejected', bg: COLORS.dangerLight, text: COLORS.danger },
  CANCELLED: { label: 'Cancelled', bg: COLORS.dangerLight, text: COLORS.danger },
  SUCCESS: { label: 'Paid', bg: COLORS.successLight, text: COLORS.success },
  PENDING: { label: 'Payment Pending', bg: COLORS.warningLight, text: COLORS.warning },
  FAILED: { label: 'Payment Failed', bg: COLORS.dangerLight, text: COLORS.danger },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, bg: '#F3F4F6', text: '#374151' };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default StatusBadge;
