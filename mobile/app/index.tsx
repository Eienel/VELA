import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import MoodFace from '../components/MoodFace';
import { fetchPortfolio, getMood, MOOD_META } from '../lib/api';

const DEMO_EVM = '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0BE';
const DEMO_SOL = 'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh';

export default function Onboard() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<'evm' | 'solana'>('evm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const go = async (addr: string, chainType: 'evm' | 'solana') => {
    if (!addr.trim()) { setError('Enter a wallet address'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await fetchPortfolio(addr.trim(), chainType);
      await AsyncStorage.setItem('vela_address', addr.trim());
      await AsyncStorage.setItem('vela_chain', chainType);
      await AsyncStorage.setItem('vela_portfolio', JSON.stringify(data));
      router.replace('/chat');
    } catch {
      setError('Could not load wallet. Check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#F5F5F7', '#FFFBEB']} style={styles.gradient}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>Vela<Text style={styles.logoDot}>.</Text></Text>
          </View>

          {/* Hero face — stable mood as preview */}
          <View style={styles.faceWrap}>
            <MoodFace mood="stable" speaking={false} thinking={false} size={110} />
          </View>

          <Text style={styles.headline}>Meet your wallet.</Text>
          <Text style={styles.sub}>
            Paste any wallet address. Vela reads your on-chain positions, feels what you feel, and talks you through it.
          </Text>

          {/* Chain toggle */}
          <View style={styles.toggleRow}>
            {(['evm', 'solana'] as const).map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setChain(c)}
                style={[styles.toggleBtn, chain === c && styles.toggleActive]}
              >
                <Text style={[styles.toggleText, chain === c && styles.toggleTextActive]}>
                  {c === 'evm' ? 'Ethereum / EVM' : 'Solana'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Address input */}
          <View style={styles.inputWrap}>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder={chain === 'evm' ? '0x...' : 'Wallet address'}
              placeholderTextColor="#AEAEB2"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => go(address, chain)}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={() => go(address, chain)}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Load my wallet →</Text>
            }
          </TouchableOpacity>

          <View style={styles.demoRow}>
            <Text style={styles.demoLabel}>Try a demo wallet  </Text>
            <TouchableOpacity onPress={() => go(DEMO_EVM, 'evm')}>
              <Text style={styles.demoLink}>EVM</Text>
            </TouchableOpacity>
            <Text style={styles.demoLabel}>  ·  </Text>
            <TouchableOpacity onPress={() => go(DEMO_SOL, 'solana')}>
              <Text style={styles.demoLink}>Solana</Text>
            </TouchableOpacity>
          </View>

          {/* Mood preview strip */}
          <View style={styles.moodStrip}>
            {(['thriving', 'stable', 'worried', 'devastated'] as const).map(m => (
              <View key={m} style={styles.moodItem}>
                <Text style={styles.moodEmoji}>{MOOD_META[m].emoji}</Text>
                <Text style={[styles.moodLabel, { color: MOOD_META[m].color }]}>{MOOD_META[m].label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  container: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 80, paddingBottom: 48 },
  logoRow: { marginBottom: 32 },
  logoText: { fontSize: 28, fontWeight: '700', color: '#1D1D1F', letterSpacing: -0.5 },
  logoDot: { color: '#FF9500' },
  faceWrap: { marginBottom: 36 },
  headline: { fontSize: 32, fontWeight: '700', color: '#1D1D1F', letterSpacing: -0.8, textAlign: 'center', marginBottom: 12 },
  sub: { fontSize: 15, color: '#6E6E73', textAlign: 'center', lineHeight: 22, marginBottom: 32, maxWidth: 320 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#F5F5F7', borderRadius: 12, padding: 3, marginBottom: 16, width: '100%' },
  toggleBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '500', color: '#AEAEB2' },
  toggleTextActive: { color: '#1D1D1F' },
  inputWrap: { width: '100%', marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E5EA', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1D1D1F', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  error: { fontSize: 13, color: '#FF3B30', marginBottom: 10, textAlign: 'center' },
  btn: { width: '100%', backgroundColor: '#1D1D1F', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  demoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 48 },
  demoLabel: { fontSize: 13, color: '#AEAEB2' },
  demoLink: { fontSize: 13, color: '#FF9500', fontWeight: '600' },
  moodStrip: { flexDirection: 'row', gap: 20, opacity: 0.75 },
  moodItem: { alignItems: 'center', gap: 4 },
  moodEmoji: { fontSize: 24 },
  moodLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
});
