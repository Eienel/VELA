'use client';
import { motion } from 'framer-motion';

const queries = [
  'What is my biggest risk?',
  'How did ETH treat me this month?',
  'Am I too concentrated?',
  'Which positions are correlated?',
  'Summarize my DeFi exposure',
  'What would a 30% ETH drop do to me?',
  'Compare my Solana and Ethereum returns',
  'What is my best performing position?',
  'How much stablecoin do I hold?',
];

export default function QueryCarousel() {
  const doubled = [...queries, ...queries];
  return (
    <section className="py-16 overflow-hidden border-t border-zinc-800">
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-8 px-8 md:px-16 max-w-7xl mx-auto">
        Ask anything
      </div>
      <div className="relative">
        <motion.div
          animate={{ x: [0, -50 * queries.length] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="flex gap-3 w-max"
        >
          {doubled.map((q, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-4 py-2 border border-zinc-800 rounded-full text-sm text-zinc-500 hover:border-amber-500 hover:text-zinc-300 transition-colors cursor-default whitespace-nowrap"
            >
              {q}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
