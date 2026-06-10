'use client';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import VelaMascot from './VelaMascot';
import MessageBubble from './MessageBubble';
import ReasoningSteps from './ReasoningSteps';
import VoiceButton from './VoiceButton';
import { getMood, getSuggestedQuestions } from '@/lib/portfolio-summary';

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
  const cachedAudio = useRef<Record<string, string>>({}); // messageId → blob URL for replay
  const [inputValue, setInputValue] = useState('');

  // Empty-wallet gate: portfolioData loaded but no positions
  const portfolioLoaded = portfolioData !== null && portfolioData !== undefined;
  const isEmpty = portfolioLoaded && (!portfolioData?.positions?.length || portfolioData.totalValue === 0);

  const mood = useMemo(
    () => getMood(portfolioData?.positions || [], portfolioData?.totalValue || 0),
    [portfolioData]
  );

  const suggestedQuestions = useMemo(
    () => getSuggestedQuestions(portfolioData?.positions || [], mood),
    [portfolioData, mood]
  );

  // Always-current ref — avoids stale closure in the transport body
  const portfolioRef = useRef(portfolioData);
  useEffect(() => { portfolioRef.current = portfolioData; }, [portfolioData]);

  // Stable transport — never recreated, so useChat never resets mid-conversation.
  // portfolioContext is read from portfolioRef (always current) at send time.
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: '/api/chat',
        headers: {},
        // body is a static base — we merge fresh portfolioContext per send in handleSend
        body: { walletAddress },
      }),
    [walletAddress]
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

  // Instant browser speech — zero network, zero latency.
  const speakWithBrowser = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) { setPlayingId(null); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.05;
    // Prefer a natural-sounding en-US voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Karen|Google US English|Zira/i.test(v.name)) ||
      voices.find(v => /en[-_]US/i.test(v.lang)) ||
      voices.find(v => /en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setPlayingId(null);
    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Play audio for a message. Primary: instant Web Speech. Simultaneously
  // fetch ElevenLabs in the background — cache it so replaying (the ↺ button)
  // uses the high-quality version instead of re-fetching.
  const playAudio = (id: string, text: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();

    // If we already have a high-quality cached blob for this message, play it.
    if (cachedAudio.current[id]) {
      const audio = new Audio(cachedAudio.current[id]);
      audioRef.current = audio;
      setPlayingId(id);
      audio.play();
      audio.onended = () => setPlayingId(null);
      return;
    }

    // Speak immediately with browser voice.
    speakWithBrowser(id, text);

    // Fetch ElevenLabs in the background and cache silently (no cutover mid-speech).
    fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mood, portfolioContext: portfolioData }),
    })
      .then(r => (r.ok ? r.blob() : null))
      .then(blob => {
        if (blob && blob.type.includes('audio')) {
          cachedAudio.current[id] = URL.createObjectURL(blob);
        }
      })
      .catch(() => {/* silent — browser speech already handled it */});
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setReasoningStep(0);
    setTimeout(() => setReasoningStep(1), 400);
    setTimeout(() => setReasoningStep(2), 800);
    // Inject current portfolio data into the message text so the server
    // always has fresh context regardless of when the transport was created.
    const portfolio = portfolioRef.current;
    const enrichedText = portfolio?.positions?.length
      ? `[PORTFOLIO_CONTEXT]${JSON.stringify(portfolio)}[/PORTFOLIO_CONTEXT]\n${text}`
      : text;
    sendMessage({ text: enrichedText });
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
    const raw = typeof msg.content === 'string'
      ? msg.content
      : msg.parts?.find((p: any) => p.type === 'text')?.text ?? '';
    // Strip injected portfolio context before displaying to the user
    return raw.replace(/^\[PORTFOLIO_CONTEXT\][\s\S]*?\[\/PORTFOLIO_CONTEXT\]\n?/, '');
  };


  if (isEmpty) {
    return (
      <div className="flex flex-col h-full bg-[#F5F5F7] items-center justify-center gap-4 px-8 text-center">
        <VelaMascot size={52} thinking={false} speaking={false} />
        <p className="text-[20px] font-semibold tracking-tight text-[#1D1D1F]">No positions found</p>
        <p className="text-[13px] text-[#AEAEB2] leading-relaxed">
          This wallet has no tokens on {chainType === 'solana' ? 'Solana' : 'this chain'}.<br />
          Try a different address or chain.
        </p>
      </div>
    );
  }

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
          {isLoading ? 'Thinking...' : playingId ? 'Speaking' : mood === 'thriving' ? '🟢 Thriving' : mood === 'worried' ? '🟡 Worried' : mood === 'devastated' ? '🔴 Devastated' : 'Ready'}
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
      <div className="px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] border-t border-[#E5E5EA] bg-white">
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
