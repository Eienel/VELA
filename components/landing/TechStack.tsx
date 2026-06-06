export default function TechStack() {
  const techs = [
    { label: 'MongoDB Atlas', desc: 'Agent memory', highlight: true },
    { label: 'Gemini 2.5 Flash', desc: 'Reasoning' },
    { label: 'Gemini TTS', desc: 'Voice' },
    { label: 'Google Cloud', desc: 'Infrastructure' },
    { label: 'Next.js 14', desc: 'Framework' },
  ];
  return (
    <section className="px-6 md:px-12 py-16 max-w-6xl mx-auto border-t border-[#F5F5F7]">
      <div className="text-[11px] tracking-[0.2em] text-[#AEAEB2] font-mono uppercase mb-8">Built with</div>
      <div className="flex flex-wrap gap-3">
        {techs.map(t => (
          <div
            key={t.label}
            className={`flex flex-col px-4 py-3 bg-white border rounded-xl shadow-card transition-colors ${
              t.highlight
                ? 'border-[#FF9500]/40 bg-orange-50/40'
                : 'border-[#E5E5EA] hover:border-[#D2D2D7]'
            }`}
          >
            <span className={`text-[14px] font-semibold ${t.highlight ? 'text-[#FF9500]' : 'text-[#1D1D1F]'}`}>{t.label}</span>
            <span className="font-mono text-[11px] text-[#AEAEB2] mt-0.5">{t.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
