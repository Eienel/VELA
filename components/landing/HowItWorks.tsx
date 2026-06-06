'use client';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { n: '01', title: 'Connect', desc: 'Link your EVM or Solana wallet. Vela reads every position.' },
    { n: '02', title: 'Ask', desc: 'Type or speak your question. Vela reasons over your real on-chain data.' },
    { n: '03', title: 'Know', desc: 'Get a clear spoken answer in seconds.' },
  ];

  return (
    <section className="px-8 md:px-16 py-24 max-w-7xl mx-auto border-t border-zinc-800/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-xs uppercase tracking-widest text-zinc-500 mb-12">How It Works</div>
        <div className="relative grid grid-cols-3 gap-8">
          {/* Connector line between circle centers */}
          <div className="absolute top-[15px] left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gradient-to-r from-amber-500/40 via-amber-500/20 to-amber-500/40" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
            >
              <div className="w-8 h-8 rounded-full border border-amber-500/60 bg-zinc-950 flex items-center justify-center mb-5 relative z-10">
                <span className="font-mono text-xs text-amber-500">{s.n}</span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2 tracking-tight">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
