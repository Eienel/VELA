export default function TechStack() {
  const techs = ['MongoDB Atlas', 'Google Cloud', 'Gemini 1.5 Pro', 'ElevenLabs', 'MCP Protocol'];
  return (
    <section className="px-8 md:px-16 py-16 max-w-7xl mx-auto border-t border-zinc-800">
      <div className="text-xs uppercase tracking-widest text-zinc-500 mb-8">Built With</div>
      <div className="flex flex-wrap gap-6">
        {techs.map(t => (
          <div key={t} className="px-4 py-2 border border-zinc-800 rounded-lg text-sm text-zinc-500">
            {t}
          </div>
        ))}
      </div>
    </section>
  );
}
