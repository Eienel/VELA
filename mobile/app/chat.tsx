import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import MoodFace from '../components/MoodFace';
import Waveform from '../components/Waveform';
import { fetchPortfolio, getMood, MOOD_META, streamChat, Mood, PortfolioData, API_BASE } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<'evm' | 'solana'>('evm');
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [mood, setMood] = useState<Mood>('stable');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [ready, setReady] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    (async () => {
      const addr = await AsyncStorage.getItem('vela_address');
      const ch = (await AsyncStorage.getItem('vela_chain')) as 'evm' | 'solana' | null;
      const cached = await AsyncStorage.getItem('vela_portfolio');
      if (!addr) { router.replace('/'); return; }
      setAddress(addr);
      setChain(ch || 'evm');
      let data: PortfolioData;
      if (cached) {
        data = JSON.parse(cached);
      } else {
        data = await fetchPortfolio(addr, ch || 'evm');
      }
      setPortfolio(data);
      const change24h = data.positions.reduce((sum, p) => sum + (p.valueUSD * p.change24h / 100), 0);
      const pct = data.totalValue > 0 ? (change24h / data.totalValue) * 100 : 0;
      const m = getMood(pct);
      setMood(m);
      setReady(true);
      // Wallet intro message
      const intro = MOOD_META[m].intro;
      setTimeout(() => {
        const id = Date.now().toString();
        setMessages([{ id, role: 'assistant', content: intro }]);
        playVoice(id, intro, m);
      }, 600);
    })();
  }, []);

  const playVoice = async (id: string, text: string, currentMood?: Mood) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      Speech.stop();
      setSpeaking(true);
      const res = await fetch(`${API_BASE}/api/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const blob = await res.blob();
        // expo-av can play from base64 or uri — use Speech as simpler fallback
        // for now use Speech with pitch adjusted per mood
        const m = currentMood || mood;
        const pitchMap: Record<Mood, number> = { thriving: 1.2, stable: 1.0, worried: 0.9, devastated: 0.75 };
        const rateMap: Record<Mood, number> = { thriving: 1.1, stable: 1.0, worried: 0.9, devastated: 0.85 };
        Speech.speak(text, {
          pitch: pitchMap[m],
          rate: rateMap[m],
          onDone: () => setSpeaking(false),
          onStopped: () => setSpeaking(false),
        });
      } else {
        useFallbackSpeech(text, currentMood || mood);
      }
    } catch {
      useFallbackSpeech(text, currentMood || mood);
    }
  };

  const useFallbackSpeech = (text: string, m: Mood) => {
    const pitchMap: Record<Mood, number> = { thriving: 1.2, stable: 1.0, worried: 0.9, devastated: 0.75 };
    const rateMap: Record<Mood, number> = { thriving: 1.1, stable: 1.0, worried: 0.9, devastated: 0.85 };
    Speech.speak(text, {
      pitch: pitchMap[m],
      rate: rateMap[m],
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
    });
  };

  const send = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { id: assistantId, role: 'assistant', content: '' }]);
    setLoading(true);
    setThinking(true);
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
    let full = '';
    try {
      for await (const chunk of streamChat(history, address, portfolio, mood)) {
        full += chunk;
        setThinking(false);
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: full } : m));
        setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 50);
      }
      playVoice(assistantId, full);
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "Couldn't reach Vela right now." } : m));
    } finally {
      setLoading(false);
      setThinking(false);
    }
  };

  const moodMeta = MOOD_META[mood];

  const suggestions = ['How am I doing today?', "What's my biggest risk?", 'If ETH drops 30%, what happens?'];

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: moodMeta.bg }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Vela<Text style={{ color: '#FF9500' }}>.</Text></Text>
            <Text style={[styles.headerSub, { color: moodMeta.color }]}>{moodMeta.label}</Text>
          </View>
          <View style={styles.headerValue}>
            <Text style={styles.valueLabel}>Portfolio</Text>
            <Text style={styles.valueNum}>${(portfolio?.totalValue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
          </View>
        </View>

        {/* Mascot */}
        <View style={styles.mascotWrap}>
          <MoodFace mood={mood} speaking={speaking} thinking={thinking} size={100} />
          {speaking && (
            <View style={styles.waveformRow}>
              <Waveform active={speaking} color={moodMeta.color} />
            </View>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => m.id}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            item.role === 'user' ? (
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userText}>{item.content}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.asstRow}>
                <View style={[styles.asstBubble, { borderLeftColor: moodMeta.color }]}>
                  {item.content ? (
                    <Text style={styles.asstText}>{item.content}</Text>
                  ) : (
                    <View style={styles.typingDots}>
                      {[0,1,2].map(i => (
                        <View key={i} style={[styles.dot, { backgroundColor: moodMeta.color }]} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )
          )}
          ListFooterComponent={
            messages.length === 0 ? (
              <View style={styles.suggestions}>
                {suggestions.map(q => (
                  <TouchableOpacity key={q} style={[styles.suggestion, { borderColor: moodMeta.color + '40' }]} onPress={() => send(q)}>
                    <Text style={[styles.suggestionText, { color: moodMeta.color }]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your wallet anything..."
            placeholderTextColor="#AEAEB2"
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={() => send()}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || loading}
            style={[styles.sendBtn, { backgroundColor: moodMeta.color }, (!input.trim() || loading) && styles.sendDisabled]}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#fff' },
  loadingText: { fontSize: 15, color: '#6E6E73' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5EA', backgroundColor: 'rgba(255,255,255,0.7)' },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 22, color: '#1D1D1F' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1D1D1F', letterSpacing: -0.3 },
  headerSub: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, marginTop: 1 },
  headerValue: { alignItems: 'flex-end' },
  valueLabel: { fontSize: 10, color: '#AEAEB2', letterSpacing: 0.3 },
  valueNum: { fontSize: 14, fontWeight: '600', color: '#1D1D1F' },
  mascotWrap: { alignItems: 'center', paddingVertical: 24 },
  waveformRow: { marginTop: 14 },
  messages: { flex: 1, paddingHorizontal: 16 },
  messagesContent: { paddingBottom: 16 },
  userRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: '#1D1D1F', borderRadius: 20, borderBottomRightRadius: 6, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '78%' },
  userText: { color: '#fff', fontSize: 15, lineHeight: 21 },
  asstRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '88%' },
  asstBubble: { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, borderLeftWidth: 3, flex: 1 },
  asstText: { color: '#1D1D1F', fontSize: 15, lineHeight: 22 },
  typingDots: { flexDirection: 'row', gap: 5, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, opacity: 0.7 },
  suggestions: { marginTop: 12, gap: 8 },
  suggestion: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, alignSelf: 'flex-start' },
  suggestionText: { fontSize: 13, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E5E5EA', backgroundColor: 'rgba(255,255,255,0.85)' },
  textInput: { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: '#1D1D1F', borderWidth: 1, borderColor: '#E5E5EA' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.35 },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: -2 },
});
