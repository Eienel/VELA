'use client';
import { motion } from 'framer-motion';
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';
import VelaMascot from './VelaMascot';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  onReplay?: () => void;
  isPlaying?: boolean;
}

export default function MessageBubble({ role, content, onReplay, isPlaying }: Props) {
  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[70%] bg-zinc-800 rounded-2xl rounded-tr-sm px-4 py-3 text-zinc-100 text-sm">
          {content}
        </div>
      </motion.div>
    );
  }

  // Format numbers in amber mono
  const formatContent = (text: string) => {
    return text.replace(/(\$[\d,]+\.?\d*|[\d,]+\.?\d*%|\d+\.?\d*[xX])/g,
      (match) => `<span class="mono text-amber-400">${match}</span>`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 mb-4"
    >
      <div className="flex-shrink-0 mt-1">
        <VelaMascot size={24} speaking={isPlaying} />
      </div>
      <div className="flex-1">
        <div
          className="text-zinc-200 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
        {isPlaying && (
          <div className="flex gap-1 mt-2 items-end h-4">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: ['4px', '12px', '4px'] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-1 bg-amber-500 rounded-full"
                style={{ minHeight: '4px' }}
              />
            ))}
          </div>
        )}
        {onReplay && (
          <button
            onClick={onReplay}
            className="mt-2 flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {isPlaying ? <SpeakerSlash size={12} /> : <SpeakerHigh size={12} />}
            {isPlaying ? 'Playing' : 'Replay'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
