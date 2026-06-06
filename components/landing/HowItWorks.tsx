'use client';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { n: '01', title: 'Connect', desc: 'Link your EVM or Solana wallet. Vela reads every position.' },
    { n: '02', title: 'Ask', desc: 'Type or speak your question. Vela reasons over your real on-chain data.' },
    { n: '03', title: 'Know', desc: 'Get a clear spoken answer in seconds.' },
  ];

  return (
    <section className="px-8 md:px-16 py-24 max-w-7xl mx-auto border-t border-zinc-800">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="text-[10px] tracking-[0.2em] text-zinc-600 font-mono uppercase mb-12">01 / How It Works</div>
        <div className="relative grid grid-cols-3 gap-8">
          {/* Connector line between square centers */}
          <div className="absolute top-[18px] left-[calc(16.67%+18px)] right-[calc(16.67%+18px)] h-px bg-zinc-800" />
          <div className="absolute top-[18px] left-[calc(16.67%+18px)] w-16 h-px bg-amber-500/50" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className={`w-9 h-9 rounded-none border bg-[#070708] flex items-center justify-center mb-5 relative z-10 ${i === 0 ? 'border-amber-500' : 'border-zinc-700'}`}>
                <span className={`font-mono text-xs ${i === 0 ? 'text-amber-500' : 'text-zinc-400'}`}>{s.n}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-zinc-100 mb-2 tracking-tight">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
