export default function TechStack() {
  const techs = [
    { label: 'MongoDB Atlas', desc: 'Agent memory', accent: true },
    { label: 'Google Cloud', desc: 'Infrastructure' },
    { label: 'Gemini 2.5 Flash', desc: 'Reasoning' },
    { label: 'Gemini TTS', desc: 'Voice' },
    { label: 'Next.js 14', desc: 'Framework' },
  ];
  return (
    <section className="px-8 md:px-16 py-16 max-w-7xl mx-auto border-t border-zinc-800">
      <div className="text-[10px] tracking-[0.2em] text-zinc-600 font-mono uppercase mb-8">03 / Built With</div>
      <div className="flex flex-wrap gap-4">
        {techs.map(t => (
          <div
            key={t.label}
            className={`flex flex-col px-4 py-3 border border-zinc-800 hover:border-zinc-700 rounded-none transition-colors ${t.accent ? 'border-l-2 border-l-amber-500' : ''}`}
          >
            <span className="text-sm text-zinc-300 font-medium">{t.label}</span>
            <span className="font-mono text-xs text-zinc-600 mt-0.5">{t.desc}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
