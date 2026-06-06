'use client';
import { motion } from 'framer-motion';

const steps = [
  { n: '01', title: 'Paste a wallet', desc: 'Any EVM or Solana address. No sign-up. Read-only by design.' },
  { n: '02', title: 'Vela wakes up', desc: 'Positions are loaded. Vela reads your P&L and picks a mood that matches.' },
  { n: '03', title: 'Just talk', desc: 'Ask anything. Vela answers in real voice — excited when you\'re up, flat when you\'re not.' },
];

export default function HowItWorks() {
  return (
    <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto border-t border-[#F0F0F5]">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <div className="text-[11px] tracking-[0.2em] text-[#AEAEB2] font-mono uppercase mb-10">How it works</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="bg-white border border-[#E8E8ED] rounded-2xl p-6"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            >
              <div className={`inline-flex w-8 h-8 rounded-xl items-center justify-center mb-5 ${i === 0 ? 'bg-[#FFF7ED] text-[#FF9500]' : 'bg-[#F5F5F7] text-[#AEAEB2]'}`}>
                <span className="font-mono text-[11px] font-semibold">{s.n}</span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#1D1D1F] mb-2 tracking-tight">{s.title}</h3>
              <p className="text-[14px] text-[#6E6E73] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
