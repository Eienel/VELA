'use client';
import { motion } from 'framer-motion';

const row1 = [
  'What is my biggest risk?', 'How did ETH treat me this month?', 'Am I too concentrated?',
  'Which positions are correlated?', 'Summarize my DeFi exposure', 'What would a 30% ETH drop do?',
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
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="flex gap-2.5 w-max"
      >
        {doubled.map((q, i) => (
          <div key={i} className="flex-shrink-0 px-4 py-2 bg-white border border-[#E8E8ED] rounded-full font-mono text-[12px] text-[#6E6E73] whitespace-nowrap"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {q}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function QueryCarousel() {
  return (
    <section className="py-16 space-y-3 bg-[#FAFAFA] border-t border-[#F0F0F5]">
      <div className="text-[11px] tracking-[0.2em] text-[#AEAEB2] font-mono uppercase mb-8 px-6 md:px-12 max-w-6xl mx-auto">Ask anything</div>
      <MarqueeRow items={row1} />
      <MarqueeRow items={row2} reverse />
    </section>
  );
}
