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

  const playAudio = async (id: string, text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(id);
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) { setPlayingId(null); return; }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setPlayingId(null);
        URL.revokeObjectURL(url);
      };
    } catch {
      setPlayingId(null);
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
    setTimeout(() => {
      handleSend(text);
    }, 800);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  // Helper to get text content from a message
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
    <div className="flex flex-col h-full">
      {/* Mascot header */}
      <div className="flex flex-col items-center pt-6 pb-4 border-b border-zinc-800">
        <VelaMascot
          size={48}
          thinking={isLoading && reasoningStep < 3}
          speaking={!!playingId}
        />
        <div className="text-xs text-zinc-600 mt-2 uppercase tracking-widest">Ask Vela</div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-start gap-3 text-zinc-600 text-sm mt-8">
            <p className="text-zinc-400">Your portfolio is loaded. Ask me anything.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {suggestedQuestions.map(q => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 border border-zinc-800 rounded-full text-zinc-500 hover:border-zinc-600 hover:text-zinc-400 transition-colors"
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
      <div className="border-t border-zinc-800 px-4 py-3">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <VoiceButton onTranscript={handleVoiceTranscript} disabled={isLoading} />
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask Vela anything about your portfolio..."
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
          >
            <ArrowUp size={16} color="#09090b" weight="bold" />
          </button>
        </form>
      </div>
    </div>
  );
}
