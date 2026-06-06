'use client';
import { motion } from 'framer-motion';
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  onReplay?: () => void;
  isPlaying?: boolean;
}

// Safe inline number highlighter — no dangerouslySetInnerHTML
function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\$[\d,]+\.?\d*|[\d,]+\.?\d*%|\d+\.?\d*[xX])/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\$[\d,]+\.?\d*$|^[\d,]+\.?\d*%$|^\d+\.?\d*[xX]$/.test(part) ? (
          <span key={i} className="font-mono text-amber-400">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function MessageBubble({ role, content, onReplay, isPlaying }: Props) {
  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end mb-5"
      >
        <div className="max-w-[72%] bg-zinc-800/80 border border-zinc-700/50 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-zinc-100 leading-relaxed">
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 mb-5"
    >
      <div className="flex-1 border-l-2 border-amber-500/25 pl-3">
        <div className="text-sm text-zinc-200 leading-relaxed">
          <HighlightedText text={content} />
        </div>

        {/* Waveform while playing */}
        {isPlaying && (
          <div className="flex gap-0.5 items-end h-3 mt-2">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-0.5 bg-amber-500 rounded-full origin-bottom"
                style={{ height: '100%' }}
              />
            ))}
          </div>
        )}

        {onReplay && (
          <button
            onClick={onReplay}
            className="mt-2 flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-500 transition-colors"
          >
            {isPlaying ? <SpeakerSlash size={11} /> : <SpeakerHigh size={11} />}
            {isPlaying ? 'Playing' : 'Replay voice'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
