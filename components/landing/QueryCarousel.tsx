'use client';
import { motion } from 'framer-motion';

const row1 = [
  'What is my biggest risk?', 'How did ETH treat me this month?', 'Am I too concentrated?',
  'Which positions are correlated?', 'Summarize my DeFi exposure', 'What would a 30% ETH drop do to me?',
  'Compare my Solana and Ethereum returns',
];
const row2 = [
  'What is my best performer?', 'How much stablecoin do I hold?', 'What is my unrealized PnL?',
  'Which chain is performing best?', 'Should I rebalance?', 'What is my cost basis on ARB?',
  'Am I overexposed to one sector?',
];

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        className="flex gap-3 w-max"
      >
        {doubled.map((q, i) => (
          <div
            key={i}
            className="flex-shrink-0 px-4 py-2 border border-zinc-800 hover:border-zinc-700 rounded-full text-sm text-zinc-500 hover:text-zinc-400 transition-colors cursor-default whitespace-nowrap"
          >
            {q}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function QueryCarousel() {
  return (
    <section className="py-16 border-t border-zinc-800/50 space-y-3">
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-8 px-8 md:px-16 max-w-7xl mx-auto">
        Ask anything
      </div>
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse />
    </section>
  );
}
