export default function TechStack() {
  const techs = [
    { label: 'MongoDB Atlas', desc: 'Agent memory & wallet history', color: '#00ED64', highlight: true },
    { label: 'Gemini 2.5 Flash', desc: 'On-chain reasoning', color: '#4285F4' },
    { label: 'Gemini TTS', desc: 'Emotional voice synthesis', color: '#7B61FF' },
    { label: 'Google Cloud', desc: 'Infrastructure', color: '#EA4335' },
    { label: 'Next.js 14', desc: 'Web framework', color: '#FFFFFF' },
    { label: 'Expo / RN', desc: 'iOS & Android', color: '#FF9500' },
  ];

  return (
    <section className="px-6 md:px-14 py-20 max-w-7xl mx-auto border-t border-white/[0.05]">
      <div className="text-[11px] tracking-[0.25em] text-white/25 font-mono uppercase mb-10">Built with</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {techs.map(t => (
          <div
            key={t.label}
            className="glass rounded-xl p-4 group hover:bg-white/[0.07] transition-colors relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-60"
              style={{ background: t.highlight ? `linear-gradient(90deg, ${t.color}, transparent)` : `${t.color}30` }} />
            <div className="w-6 h-6 rounded-lg mb-3 flex items-center justify-center text-sm"
              style={{ background: `${t.color}18`, border: `1px solid ${t.color}30` }}>
              <span style={{ color: t.color }} className="text-[10px] font-bold">{t.label.slice(0,1)}</span>
            </div>
            <div className="text-[13px] font-semibold text-white/80">{t.label}</div>
            <div className="text-[11px] font-mono text-white/30 mt-0.5 leading-snug">{t.desc}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-[13px] text-white/20">Vela — Built for the Google Cloud Hackathon 2026</span>
        <span className="text-[11px] font-mono text-white/15 uppercase tracking-wider">Read-only · Voice-first · On-chain</span>
      </div>
    </section>
  );
}
