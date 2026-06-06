'use client';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import VelaMascot from './VelaMascot';
import MessageBubble from './MessageBubble';
import ReasoningSteps from './ReasoningSteps';
import VoiceButton from './VoiceButton';

interface Props {
  walletAddress: string;
  chainType: 'evm' | 'solana';
  portfolioData?: any;
}

export default function ChatPanel({ walletAddress, chainType, portfolioData }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [reasoningStep, setReasoningStep] = useState<number>(-1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Derive mood from portfolio data
  const mood = useMemo(() => {
    if (!portfolioData?.positions?.length) return 'stable';
    const change24h = portfolioData.positions.reduce(
      (sum: number, p: any) => sum + (p.valueUSD * p.change24h / 100), 0
    );
    const pct = portfolioData.totalValue > 0 ? (change24h / portfolioData.totalValue) * 100 : 0;
    if (pct > 3) return 'thriving';
    if (pct > -1) return 'stable';
    if (pct > -5) return 'worried';
    return 'devastated';
  }, [portfolioData]);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: '/api/chat',
        body: {
          walletAddress,
          portfolioContext: portfolioData,
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletAddress, portfolioData]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onFinish: ({ message }) => {
      setReasoningStep(3);
      setTimeout(() => setReasoningStep(-1), 500);
      const textPart = message.parts?.find((p: any) => p.type === 'text');
      const text = textPart ? (textPart as any).text : '';
      if (text) playAudio(message.id, text);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const speakWithBrowser = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setPlayingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /en[-_]US/i.test(v.lang) && /Google|Samantha|Daniel/i.test(v.name))
      || voices.find(v => /en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setPlayingId(null);
    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const playAudio = async (id: string, text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setPlayingId(id);
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mood, portfolioContext: portfolioData }),
      });
      if (!response.ok) { speakWithBrowser(id, text); return; }
      const blob = await response.blob();
      if (blob.size === 0 || !blob.type.includes('audio')) { speakWithBrowser(id, text); return; }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(url);
      };
    } catch {
      speakWithBrowser(id, text);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setReasoningStep(0);
    setTimeout(() => setReasoningStep(1), 400);
    setTimeout(() => setReasoningStep(2), 800);
    sendMessage({ text });
    setInputValue('');
  };

  const handleVoiceTranscript = (text: string) => {
    setInputValue(text);
    setTimeout(() => handleSend(text), 800);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  const getMessageText = (msg: any): string => {
    if (typeof msg.content === 'string') return msg.content;
    const textPart = msg.parts?.find((p: any) => p.type === 'text');
    return textPart ? textPart.text : '';
  };

  const suggestedQuestions = [
    'What is my biggest risk?',
    'How is my Solana bag doing?',
    'If ETH drops 30%, what happens?',
  ];

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7]">
      {/* Mascot header */}
      <div className="flex flex-col items-center pt-5 pb-4 border-b border-[#E5E5EA] bg-white">
        <VelaMascot
          size={44}
          thinking={isLoading && reasoningStep < 3}
          speaking={!!playingId}
        />
        <div className="text-[11px] text-[#AEAEB2] mt-2 uppercase tracking-[0.2em] font-mono">
          {isLoading ? 'Thinking...' : playingId ? 'Speaking' : 'Ready'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-start gap-3 mt-6">
            <p className="text-[22px] font-semibold tracking-tight text-[#1D1D1F] leading-tight">
              Ask anything about<br />your positions.
            </p>
            <p className="text-[12px] text-[#AEAEB2] uppercase tracking-[0.18em] font-mono">Portfolio loaded · Ready</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="font-mono text-[12px] px-3 py-1.5 bg-white border border-[#D2D2D7] rounded-full text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] hover:border-[#AEAEB2] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const text = getMessageText(msg);
          return (
            <div key={msg.id}>
              {msg.role === 'assistant' && isLoading && i === messages.length - 1 && reasoningStep >= 0 && reasoningStep < 3 && (
                <ReasoningSteps activeStep={reasoningStep} />
              )}
              <MessageBubble
                role={msg.role as 'user' | 'assistant'}
                content={text}
                onReplay={msg.role === 'assistant' ? () => playAudio(msg.id, text) : undefined}
                isPlaying={playingId === msg.id}
              />
            </div>
          );
        })}

        {isLoading && reasoningStep >= 0 && reasoningStep < 3 && messages[messages.length - 1]?.role === 'user' && (
          <ReasoningSteps activeStep={reasoningStep} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#E5E5EA] bg-white">
        <form onSubmit={onSubmit} className="flex items-center gap-2 bg-[#F5F5F7] border border-[#D2D2D7] rounded-full px-4 py-2">
          <VoiceButton onTranscript={handleVoiceTranscript} disabled={isLoading} />
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask Vela about your portfolio..."
            className="flex-1 bg-transparent text-[14px] text-[#1D1D1F] placeholder-[#AEAEB2] outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#3056D7] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2647BD] transition-all active:scale-95"
          >
            <ArrowUp size={14} color="white" weight="bold" />
          </button>
        </form>
      </div>
    </div>
  );
}
