import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Smartphone, LockKeyhole } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import COLORS from '../../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithOtp, isLoading } = useContext(AuthContext);
  const [mode, setMode] = useState('PASSWORD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState('');
  const [busyOtp, setBusyOtp] = useState(false);
  const [error, setError] = useState('');

  const goHome = (user) => router.replace(user?.role === 'admin' ? '/admin/dashboard' : '/(tabs)/home');

  const handlePasswordLogin = async () => {
    setError('');
    if (!email.trim() || !password) return setError('Enter your email and password.');
    const res = await login(email.trim().toLowerCase(), password);
    if (res.success) goHome(res.user);
    else setError(res.message || 'Invalid credentials');
  };

  const handleSendOtp = async () => {
    setError('');
    if (!/^\+?\d[\d\s-]{9,14}$/.test(phone.trim())) return setError('Enter a valid 10-digit phone number.');
    setBusyOtp(true);
    try {
      const res = await authService.requestOtp(phone.trim());
      if (res.success) {
        setChallengeId(res.challengeId);
        setOtpSent(true);
        setDevOtp(res.devOtp || '');
      } else setError(res.message || 'Could not send OTP');
    } catch (e) { setError(e.message || 'Could not send OTP'); }
    finally { setBusyOtp(false); }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit OTP.');
    const res = await loginWithOtp(phone.trim(), challengeId, otp);
    if (res.success) goHome(res.user);
    else setError(res.message || 'Invalid OTP');
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.logo}><Text style={styles.logoText}>W</Text></View>
          <Text style={styles.brand}>WRAPCHIK</Text>
          <Text style={styles.tagline}>Campus cravings. One tap away. 🌯</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Choose how you want to sign in.</Text>

          <View style={styles.modeTabs}>
            <TouchableOpacity style={[styles.modeTab, mode === 'PASSWORD' && styles.modeTabActive]} onPress={() => { setMode('PASSWORD'); setError(''); }}>
              <LockKeyhole size={17} color={mode === 'PASSWORD' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.modeText, mode === 'PASSWORD' && styles.modeTextActive]}>Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modeTab, mode === 'OTP' && styles.modeTabActive]} onPress={() => { setMode('OTP'); setError(''); }}>
              <Smartphone size={17} color={mode === 'OTP' ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.modeText, mode === 'OTP' && styles.modeTextActive]}>Phone OTP</Text>
            </TouchableOpacity>
          </View>

          {mode === 'PASSWORD' ? (
            <>
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
              <Button title="Sign In" onPress={handlePasswordLogin} loading={isLoading} style={styles.mainButton} />
            </>
          ) : (
            <>
              <Input label="Phone number" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" />
              {!otpSent ? (
                <Button title="Send OTP" onPress={handleSendOtp} loading={busyOtp} style={styles.mainButton} />
              ) : (
                <>
                  <View style={styles.otpHeader}>
                    <Text style={styles.otpInfo}>OTP sent to {phone}</Text>
                    <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}><Text style={styles.changeLink}>Change</Text></TouchableOpacity>
                  </View>
                  <Input label="6-digit OTP" value={otp} onChangeText={setOtp} placeholder="123456" keyboardType="number-pad" />
                  {__DEV__ && devOtp ? <Text style={styles.devOtp}>DEV OTP: {devOtp}</Text> : null}
                  <Button title="Verify & Sign In" onPress={handleVerifyOtp} loading={isLoading} style={styles.mainButton} />
                  <TouchableOpacity onPress={handleSendOtp} style={styles.resend}><Text style={styles.resendText}>Resend OTP</Text></TouchableOpacity>
                </>
              )}
            </>
          )}

          {error ? <Text style={styles.error}>⚠ {error}</Text> : null}

          <View style={styles.securityRow}>
            <ShieldCheck size={17} color={COLORS.success} />
            <Text style={styles.securityText}>Encrypted session • Protected authentication</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Wrapchik?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}><Text style={styles.link}> Create account</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F3' },
  scrollContent: { padding: 22, paddingTop: 42, paddingBottom: 36 },
  hero: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 62, height: 62, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  logoText: { color: '#FFF', fontSize: 34, fontWeight: '900' },
  brand: { marginTop: 12, color: COLORS.textPrimary, fontSize: 23, fontWeight: '900', letterSpacing: 2 },
  tagline: { marginTop: 5, color: COLORS.textSecondary, fontSize: 13 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F0E5DE', elevation: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  title: { fontSize: 25, fontWeight: '900', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: 18 },
  modeTabs: { flexDirection: 'row', backgroundColor: '#F7F7F7', borderRadius: 13, padding: 4, marginBottom: 18 },
  modeTab: { flex: 1, flexDirection: 'row', height: 43, alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 10 },
  modeTabActive: { backgroundColor: '#FFF', elevation: 1 },
  modeText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  modeTextActive: { color: COLORS.primary },
  mainButton: { marginTop: 4 },
  otpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  otpInfo: { fontSize: 12, color: COLORS.textSecondary },
  changeLink: { color: COLORS.primary, fontWeight: '800', fontSize: 12 },
  devOtp: { textAlign: 'center', color: COLORS.warning, fontWeight: '800', marginBottom: 10 },
  resend: { alignItems: 'center', padding: 12 },
  resendText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  error: { color: COLORS.danger, backgroundColor: COLORS.dangerLight, borderRadius: 10, padding: 10, marginTop: 12, fontSize: 12, fontWeight: '700' },
  securityRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 18 },
  securityText: { color: COLORS.textSecondary, fontSize: 11 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: COLORS.textSecondary, fontSize: 13 },
  link: { color: COLORS.primary, fontWeight: '900', fontSize: 13 },
});
