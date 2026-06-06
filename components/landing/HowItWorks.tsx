'use client';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { n: '01', title: 'Connect', desc: 'Link your EVM or Solana wallet. Vela reads every position on-chain.' },
    { n: '02', title: 'Ask', desc: 'Type or speak your question. Vela reasons over your real data.' },
    { n: '03', title: 'Know', desc: 'Get a clear spoken answer in seconds. No dashboards needed.' },
  ];

  return (
    <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto border-t border-[#F5F5F7]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-[11px] tracking-[0.2em] text-[#AEAEB2] font-mono uppercase mb-10">How it works</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              className="bg-white border border-[#E5E5EA] rounded-2xl p-6 shadow-card"
            >
              <div className={`inline-flex w-8 h-8 rounded-xl items-center justify-center mb-4 ${i === 0 ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-[#F5F5F7] text-[#AEAEB2]'}`}>
                <span className="font-mono text-[11px] font-semibold">{s.n}</span>
              </div>
              <h3 className="text-[17px] font-semibold text-[#1D1D1F] mb-2 tracking-tight">{s.title}</h3>
              <p className="text-[14px] text-[#6E6E73] leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
