import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import COLORS from '../../constants/colors';

export default function PhoneVerificationScreen() {
  const router = useRouter();
  const { phone, challengeId, devOtp } = useLocalSearchParams();
  const { loginWithOtp, isLoading } = useContext(AuthContext);
  const [otp, setOtp] = useState(devOtp || '');
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const verify = async () => {
    setError('');
    if (!/^\d{6}$/.test(String(otp))) return setError('Enter the 6-digit OTP');
    const res = await loginWithOtp(String(phone), String(challengeId), String(otp));
    if (res.success) router.replace('/(tabs)/home');
    else setError(res.message || 'Invalid OTP');
  };

  const resend = async () => {
    setResending(true); setError('');
    try {
      const res = await authService.requestOtp(String(phone));
      if (res.success) Alert.alert('OTP sent', 'A new verification code has been sent.');
      else setError(res.message || 'Could not resend OTP');
    } catch (e) { setError(e.message); }
    finally { setResending(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.icon}><ShieldCheck size={34} color={COLORS.primary} /></View>
      <Text style={styles.title}>Verify your phone</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {phone}.</Text>
      <Input label="Verification code" value={otp} onChangeText={setOtp} placeholder="123456" keyboardType="number-pad" />
      {__DEV__ && devOtp ? <Text style={styles.dev}>DEV OTP: {devOtp}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Verify phone" onPress={verify} loading={isLoading} />
      <TouchableOpacity onPress={resend} disabled={resending} style={styles.resend}><Text style={styles.resendText}>{resending ? 'Sending…' : 'Resend OTP'}</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}><Text style={styles.skip}>Skip for now</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F3', padding: 24, justifyContent: 'center' },
  icon: { width: 68, height: 68, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  dev: { color: COLORS.warning, textAlign: 'center', fontWeight: '800', marginBottom: 12 },
  error: { color: COLORS.danger, backgroundColor: COLORS.dangerLight, padding: 10, borderRadius: 10, marginBottom: 12, fontSize: 12, fontWeight: '700' },
  resend: { alignItems: 'center', padding: 14 },
  resendText: { color: COLORS.primary, fontWeight: '800' },
  skip: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 8, fontSize: 12 },
});
