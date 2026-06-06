'use client';
import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    emoji: '🔗',
    title: 'Paste a wallet',
    desc: 'Any EVM or Solana address. No sign-up, no wallet connection required. Read-only by design.',
    color: '#FF9500',
  },
  {
    n: '02',
    emoji: '🧠',
    title: 'Vela wakes up',
    desc: 'Your on-chain positions are loaded instantly. Vela reads P&L and adopts a mood that matches your portfolio.',
    color: '#7B61FF',
  },
  {
    n: '03',
    emoji: '🗣️',
    title: 'Have a conversation',
    desc: 'Type or speak. Vela answers in real voice — excited when you\'re winning, upset when you\'re not.',
    color: '#34C759',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative px-6 md:px-14 py-24 max-w-7xl mx-auto border-t border-white/[0.05]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-[11px] tracking-[0.25em] text-white/25 font-mono uppercase mb-4">How it works</div>
        <h2 className="text-[36px] font-bold tracking-tight text-white mb-14">
          Three steps to a wallet<br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(90deg, #FF9500, #FFD60A)' }}>
            that talks back.
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="glass rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.07] transition-colors"
            >
              {/* Glow accent top-right */}
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `radial-gradient(circle, ${s.color}20 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />

              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{s.emoji}</span>
                <span className="font-mono text-[11px] text-white/20">{s.n}</span>
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-2 tracking-tight">{s.title}</h3>
              <p className="text-[14px] text-white/45 leading-relaxed">{s.desc}</p>
              <div className="mt-4 h-0.5 rounded-full w-8" style={{ background: s.color }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
