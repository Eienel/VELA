export default function HowItWorks() {
  const steps = [
    { n: '01', title: 'Connect', desc: 'Link your EVM or Solana wallet. Vela reads every position.' },
    { n: '02', title: 'Ask', desc: 'Type or speak your question. Vela reasons over your real on-chain data.' },
    { n: '03', title: 'Know', desc: 'Get a clear spoken answer in seconds.' },
  ];

  return (
    <section className="px-8 md:px-16 py-24 max-w-7xl mx-auto">
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-12">How It Works</div>
      <div className="relative grid grid-cols-3 gap-8">
        <div className="absolute top-4 left-[16%] right-[16%] h-px bg-amber-500 opacity-30" />
        {steps.map((s) => (
          <div key={s.n}>
            <div className="w-8 h-8 rounded-full border border-amber-500 flex items-center justify-center mb-4">
              <span className="mono text-xs text-amber-500">{s.n}</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2 tracking-tight">{s.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
