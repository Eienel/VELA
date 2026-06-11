'use client';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import VelaMascot from './VelaMascot';
import MessageBubble from './MessageBubble';
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
  const cachedAudio = useRef<Record<string, string>>({});
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
      const textPart = message.parts?.find((p: any) => p.type === 'text');
      const fullText = textPart ? (textPart as any).text : '';
      if (!fullText) return;
      // Text reveals (pending→false) and voice start together
      setPlayingId(message.id);
      queueSpeech(fullText, () => setPlayingId(null));
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const getBestVoice = () => {
    if (typeof window === 'undefined') return undefined;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => /en[-_]US/i.test(v.lang) && /Samantha|Karen|Google US English|Zira/i.test(v.name)) ||
      voices.find(v => /en[-_]US/i.test(v.lang)) ||
      voices.find(v => /en/i.test(v.lang))
    );
  };

  // Queue a chunk of text into the browser speech queue without cancelling.
  // onDone fires after this specific utterance ends.
  const queueSpeech = (text: string, onDone?: () => void) => {
    if (!text.trim() || typeof window === 'undefined' || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text.trim());
    u.rate = 1.05;
    u.pitch = 1.05;
    const v = getBestVoice();
    if (v) u.voice = v;
    if (onDone) u.onend = onDone;
    window.speechSynthesis.speak(u);
  };

  // Replay: speak full text for a message (cancels current speech first).
  const playAudio = (id: string, text: string) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setPlayingId(id);

    // Cached high-quality blob from a previous ElevenLabs fetch → use that.
    if (cachedAudio.current[id]) {
      const audio = new Audio(cachedAudio.current[id]);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setPlayingId(null);
      return;
    }

    queueSpeech(text, () => setPlayingId(null));

    // Cache ElevenLabs blob silently for future replays.
    fetch('/api/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mood, portfolioContext: portfolioData }),
    })
      .then(r => (r.ok ? r.blob() : null))
      .then(blob => { if (blob?.type.includes('audio')) cachedAudio.current[id] = URL.createObjectURL(blob); })
      .catch(() => {});
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    window.speechSynthesis?.cancel();
    setPlayingId(null);
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
          const isStreamingThis = isLoading && i === messages.length - 1 && msg.role === 'assistant';
          return (
            <div key={msg.id}>
              <MessageBubble
                role={msg.role as 'user' | 'assistant'}
                content={text}
                pending={isStreamingThis}
                onReplay={msg.role === 'assistant' ? () => playAudio(msg.id, text) : undefined}
                isPlaying={playingId === msg.id}
              />
            </div>
          );
        })}

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
