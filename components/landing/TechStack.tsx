export default function TechStack() {
  const techs = [
    { label: 'MongoDB Atlas', desc: 'Agent memory', highlight: true },
    { label: 'Gemini 2.5 Flash', desc: 'Reasoning' },
    { label: 'Gemini TTS', desc: 'Voice' },
    { label: 'Google Cloud', desc: 'Infrastructure' },
    { label: 'Next.js 14', desc: 'Web' },
    { label: 'Expo', desc: 'iOS & Android' },
  ];
  return (
    <section className="px-6 md:px-12 py-16 max-w-6xl mx-auto border-t border-[#F0F0F5]">
      <div className="text-[11px] tracking-[0.2em] text-[#AEAEB2] font-mono uppercase mb-8">Built with</div>
      <div className="flex flex-wrap gap-3">
        {techs.map(t => (
          <div key={t.label}
            className={`flex flex-col px-4 py-3 bg-white border rounded-xl ${t.highlight ? 'border-[#1D1D1F]/30 bg-[#FFF7ED]' : 'border-[#E8E8ED]'}`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <span className={`text-[13px] font-semibold ${t.highlight ? 'text-[#1D1D1F]' : 'text-[#1D1D1F]'}`}>{t.label}</span>
            <span className="font-mono text-[11px] text-[#AEAEB2] mt-0.5">{t.desc}</span>
          </div>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-[#F0F0F5] flex items-center justify-between">
        <span className="text-[12px] text-[#AEAEB2]">Vela — Google Cloud Hackathon 2026</span>
        <span className="text-[11px] font-mono text-[#D2D2D7] uppercase tracking-wider">Read-only · Voice-first</span>
      </div>
    </section>
  );
}
