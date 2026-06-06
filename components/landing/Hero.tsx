'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VelaMascot from '../dashboard/VelaMascot';
import ConnectWallet from '../ui/ConnectWallet';
import { useRouter } from 'next/navigation';

const demos = [
  {
    user: 'If ETH drops 30%, what happens?',
    vela: <>Portfolio drops roughly <span className="text-[#FF9500] font-mono font-semibold">$14,200</span>. ARB takes the hardest hit — <span className="text-[#FF9500] font-mono font-semibold">87%</span> correlated to ETH.</>,
  },
  {
    user: 'How concentrated am I?',
    vela: <>Top 3 positions = <span className="text-[#FF9500] font-mono font-semibold">73%</span> of your value. ETH at <span className="text-[#FF9500] font-mono font-semibold">48%</span>, ARB at <span className="text-[#FF9500] font-mono font-semibold">23%</span>.</>,
  },
  {
    user: 'What is my worst performer?',
    vela: <>ARB is down <span className="text-[#FF9500] font-mono font-semibold">18.3%</span> since entry — <span className="text-[#FF9500] font-mono font-semibold">$847</span> in the red. Your highest-risk hold.</>,
  },
];

const ASCII_VELA = `
██╗   ██╗███████╗██╗      █████╗
██║   ██║██╔════╝██║     ██╔══██╗
██║   ██║█████╗  ██║     ███████║
╚██╗ ██╔╝██╔══╝  ██║     ██╔══██║
 ╚████╔╝ ███████╗███████╗██║  ██║
  ╚═══╝  ╚══════╝╚══════╝╚═╝  ╚═╝`;

export default function Hero() {
  const router = useRouter();
  const [demoIndex, setDemoIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowAnswer(true), 1400);
    const t2 = setTimeout(() => {
      setShowAnswer(false);
      setTimeout(() => { setDemoIndex(i => (i + 1) % demos.length); setShowAnswer(true); }, 350);
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [demoIndex]);

  const handleConnect = (address: string, chainType: 'evm' | 'solana') => {
    localStorage.setItem('vela_address', address);
    localStorage.setItem('vela_chain', chainType);
    router.push('/dashboard');
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* ── Background layers ── */}
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-100" />

      {/* Gradient orbs */}
      <div className="absolute top-[-180px] left-[-120px] w-[600px] h-[600px] rounded-full orb"
        style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-200px] right-[-100px] w-[700px] h-[700px] rounded-full orb-slow"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.14) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute top-[40%] left-[55%] w-[400px] h-[400px] rounded-full orb"
        style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.08) 0%, transparent 70%)', filter: 'blur(50px)', animationDelay: '4s' }} />

      {/* ASCII watermark */}
      <div className="absolute bottom-8 right-4 ascii-bg text-[11px] text-white/[0.03] select-none hidden lg:block" aria-hidden>
        {ASCII_VELA}
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-14 h-16 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <VelaMascot size={26} />
          <span className="font-bold text-white text-[15px] tracking-tight">
            Vela<span className="text-[#FF9500]">.</span>
          </span>
          <span className="hidden md:block text-[10px] text-white/30 ml-2 font-mono uppercase tracking-[0.2em]">Portfolio AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-white/40 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] inline-block" />
            EVM + Solana
          </span>
          <button
            onClick={() => setShowConnect(true)}
            className="text-[13px] font-semibold text-[#FF9500] hover:text-[#FFB340] transition-colors"
          >
            Connect →
          </button>
        </div>
      </nav>

      {/* ── Hero content ── */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-14 py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-16 w-full items-center">

          {/* Left */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
            >
              <span className="text-[11px] font-mono text-white/50 uppercase tracking-widest">Voice-first · Read-only · On-chain</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[58px] md:text-[78px] font-bold tracking-[-0.04em] leading-[0.95] text-white mb-6"
            >
              Your wallet<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #FF9500 0%, #FFD60A 50%, #FF6B00 100%)' }}>
                has feelings.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[17px] text-white/50 max-w-[420px] leading-relaxed mb-10"
            >
              Paste any wallet address. Vela reads your on-chain positions, feels your P&L, and talks you through it — voice-first, emotionally.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {showConnect ? (
                  <motion.div key="connect" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <ConnectWallet onConnect={handleConnect} dark />
                  </motion.div>
                ) : (
                  <motion.div key="cta" className="flex gap-3 flex-wrap" exit={{ opacity: 0 }}>
                    <button
                      onClick={() => setShowConnect(true)}
                      className="btn-glow px-7 py-3.5 rounded-full font-semibold text-[15px] text-black transition-all active:scale-[0.97]"
                      style={{ background: 'linear-gradient(135deg, #FF9500, #FFD60A)' }}
                    >
                      Try your wallet
                    </button>
                    <button
                      disabled
                      className="px-7 py-3.5 rounded-full font-semibold text-[15px] glass text-white/40 cursor-not-allowed"
                    >
                      Hear a demo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mood strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-5 mt-10"
            >
              {[
                { emoji: '🤩', label: 'Up big', color: '#34C759' },
                { emoji: '😐', label: 'Steady', color: '#FF9500' },
                { emoji: '😟', label: 'Worried', color: '#FF9500' },
                { emoji: '😭', label: 'Hurting', color: '#FF3B30' },
              ].map(m => (
                <div key={m.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: m.color }}>{m.label}</span>
                </div>
              ))}
              <div className="flex items-end pb-0.5 ml-1">
                <span className="text-[11px] text-white/20 font-mono">← Vela's mood mirrors yours</span>
              </div>
            </motion.div>
          </div>

          {/* Right — chat card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="glass rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07] bg-white/[0.03]">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span className="flex-1 text-center text-[11px] font-mono text-white/20">vela — 0x3f5C...f0BE</span>
              <span className="text-[10px] font-mono text-[#FF9500]/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] inline-block" />live
              </span>
            </div>

            {/* Wallet mood header */}
            <div className="px-5 pt-5 pb-3 border-b border-white/[0.05] flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: 'rgba(255,149,0,0.15)', border: '1px solid rgba(255,149,0,0.2)' }}>
                {showAnswer ? '😐' : '🤔'}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">Your wallet</div>
                <div className="text-[11px] font-mono text-white/30 mt-0.5">+2.3% today · Steady</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[18px] font-bold text-white">$40,283</div>
                <div className="text-[11px] font-mono text-[#34C759]">+$912 today</div>
              </div>
            </div>

            {/* Chat */}
            <div className="p-5 space-y-4 min-h-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`user-${demoIndex}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end"
                >
                  <div className="glass rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] text-white/80 max-w-[85%]">
                    {demos[demoIndex].user}
                  </div>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] text-white/70 leading-relaxed max-w-[90%]"
                  >
                    {demos[demoIndex].vela}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Speaking indicator */}
            <div className="px-5 pb-5 flex items-center gap-2">
              {showAnswer ? (
                <>
                  {[0,1,2,3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: ['3px','14px','3px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 rounded-full bg-[#FF9500]"
                      style={{ minHeight: 3 }}
                    />
                  ))}
                  <span className="text-[10px] font-mono text-white/30 ml-1 uppercase tracking-wider">Speaking</span>
                </>
              ) : (
                <span className="text-[10px] font-mono text-white/20">Thinking...</span>
              )}
            </div>

            {/* Input bar */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-2.5">
                <span className="text-[13px] text-white/20 flex-1">Ask your wallet anything...</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF9500, #FFD60A)' }}>
                  <span className="text-black text-xs font-bold">↑</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #06060A, transparent)' }} />
    </section>
  );
}
