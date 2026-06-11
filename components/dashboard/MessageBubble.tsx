'use client';
import { motion } from 'framer-motion';
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react';

interface Props {
  role: 'user' | 'assistant';
  content: string;
  onReplay?: () => void;
  isPlaying?: boolean;
  pending?: boolean;
}

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/(\$[\d,]+\.?\d*|[\d,]+\.?\d*%|\d+\.?\d*[xX])/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\$[\d,]+\.?\d*$|^[\d,]+\.?\d*%$|^\d+\.?\d*[xX]$/.test(part) ? (
          <span key={i} className="font-mono text-[#3056D7] font-medium">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function MessageBubble({ role, content, onReplay, isPlaying, pending }: Props) {
  if (role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[72%] bg-[#1D1D1F] rounded-2xl rounded-br-md px-4 py-2.5 text-[14px] text-white leading-relaxed">
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
      className="flex gap-3 mb-4"
    >
      <div className="flex-1">
        {pending ? (
          <div className="flex gap-0.5 items-end h-4 py-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.2, 1, 0.2] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                className="w-0.5 bg-[#AEAEB2] rounded-full origin-bottom"
                style={{ height: '100%' }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="text-[14px] text-[#1D1D1F] leading-relaxed"
          >
            <HighlightedText text={content} />
          </motion.div>
        )}

        {!pending && isPlaying && (
          <div className="flex gap-0.5 items-end h-3 mt-2">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-0.5 bg-[#1D1D1F] rounded-full origin-bottom"
                style={{ height: '100%' }}
              />
            ))}
          </div>
        )}

        {!pending && onReplay && (
          <button
            onClick={onReplay}
            className="mt-2 flex items-center gap-1.5 text-[12px] text-[#AEAEB2] hover:text-[#6E6E73] transition-colors"
          >
            {isPlaying ? <SpeakerSlash size={11} /> : <SpeakerHigh size={11} />}
            {isPlaying ? 'Playing' : 'Replay voice'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
