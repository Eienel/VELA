'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VelaMascot from '../dashboard/VelaMascot';
import ConnectWallet from '../ui/ConnectWallet';
import { useRouter } from 'next/navigation';

const demos = [
  {
    user: 'If ETH drops 30%, what happens?',
    vela: <>Portfolio drops roughly <span className="font-mono font-semibold text-[#FF9500]">$14,200</span>. ARB takes the hardest hit — <span className="font-mono font-semibold text-[#FF9500]">87%</span> correlated to ETH.</>,
  },
  {
    user: 'How concentrated am I?',
    vela: <>Top 3 positions = <span className="font-mono font-semibold text-[#FF9500]">73%</span> of your portfolio. ETH at <span className="font-mono font-semibold text-[#FF9500]">48%</span>, ARB at <span className="font-mono font-semibold text-[#FF9500]">23%</span>.</>,
  },
  {
    user: "What's my worst position?",
    vela: <>ARB is down <span className="font-mono font-semibold text-[#FF9500]">18.3%</span> since entry — <span className="font-mono font-semibold text-[#FF9500]">$847</span> in the red. Your highest-risk hold right now.</>,
  },
];

const moods = [
  { emoji: '🤩', label: 'Thriving', bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' },
  { emoji: '😐', label: 'Steady',   bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  { emoji: '😟', label: 'Worried',  bg: '#FFF7ED', border: '#FDBA74', text: '#EA580C' },
  { emoji: '😭', label: 'Hurting',  bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48' },
];

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
    }, 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [demoIndex]);

  const handleConnect = (address: string, chainType: 'evm' | 'solana') => {
    localStorage.setItem('vela_address', address);
    localStorage.setItem('vela_chain', chainType);
    router.push('/dashboard');
  };

  return (
    <>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#F0F0F5]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2.5">
            <VelaMascot size={26} />
            <span className="font-bold text-[#1D1D1F] text-[15px] tracking-tight">
              Vela<span className="text-[#FF9500]">.</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5 text-[12px] text-[#AEAEB2] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] inline-block" />
              EVM + Solana · Read-only
            </span>
            <button
              onClick={() => setShowConnect(true)}
              className="btn-amber-glow bg-[#FF9500] text-white text-[13px] font-semibold px-4 py-2 rounded-full"
            >
              Try your wallet →
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Warm light gradient orbs */}
        <div className="orb-warm w-[520px] h-[520px] top-[-160px] left-[-140px]"
          style={{ background: 'radial-gradient(circle, rgba(255,149,0,0.10) 0%, transparent 70%)' }} />
        <div className="orb-warm orb-warm-2 w-[400px] h-[400px] top-[10%] right-[-100px]"
          style={{ background: 'radial-gradient(circle, rgba(52,199,89,0.08) 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-12 items-center">

          {/* Left */}
          <div>
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#FFF7ED] border border-[#FDBA74] rounded-full px-3.5 py-1.5 mb-7"
            >
              <span className="text-[11px] font-semibold text-[#EA580C] uppercase tracking-wider">Voice-first · On-chain · Read-only</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-[56px] md:text-[70px] font-bold tracking-[-0.035em] leading-[1.0] text-[#1D1D1F] mb-5"
            >
              Your wallet<br />
              <span className="text-[#FF9500]">has feelings.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[17px] text-[#6E6E73] max-w-[400px] leading-relaxed mb-8"
            >
              Paste any wallet address. Vela reads your positions, feels your P&L, and talks you through it in real voice — excited when you're up, worried when you're not.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AnimatePresence mode="wait">
                {showConnect ? (
                  <motion.div key="wc" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <ConnectWallet onConnect={handleConnect} />
                  </motion.div>
                ) : (
                  <motion.div key="cta" className="flex gap-3 flex-wrap" exit={{ opacity: 0 }}>
                    <button
                      onClick={() => setShowConnect(true)}
                      className="btn-amber-glow bg-[#FF9500] hover:bg-[#F08C00] text-white font-semibold text-[15px] px-7 py-3.5 rounded-full"
                    >
                      Try your wallet
                    </button>
                    <button
                      disabled
                      className="border border-[#E8E8ED] text-[#AEAEB2] font-semibold text-[15px] px-7 py-3.5 rounded-full cursor-not-allowed"
                    >
                      Hear a demo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Mood pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2 mt-9"
            >
              {moods.map(m => (
                <div
                  key={m.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold"
                  style={{ background: m.bg, borderColor: m.border, color: m.text }}
                >
                  <span>{m.emoji}</span>
                  <span>{m.label}</span>
                </div>
              ))}
              <div className="flex items-center px-3 py-1.5">
                <span className="text-[11px] text-[#AEAEB2] font-mono">← Vela mirrors your P&L</span>
              </div>
            </motion.div>
          </div>

          {/* Right — chat card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl overflow-hidden border border-[#E8E8ED] bg-white"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)' }}
          >
            {/* macOS chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#F9F9FB] border-b border-[#E8E8ED]">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span className="flex-1 text-center text-[11px] font-mono text-[#AEAEB2]">vela — 0x3f5C...f0BE</span>
            </div>

            {/* Wallet header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F5F5F7]">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl bg-[#FFF7ED] border border-[#FDBA74]">
                {showAnswer ? '😐' : '🤔'}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1D1D1F]">Your wallet</div>
                <div className="text-[11px] font-mono text-[#AEAEB2] mt-0.5">+2.3% today · Steady</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-[18px] font-bold text-[#1D1D1F]">$40,283</div>
                <div className="text-[11px] font-mono text-[#34C759]">+$912 today</div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 min-h-[180px] bg-[#FAFAFA]">
              <AnimatePresence mode="wait">
                <motion.div key={`u-${demoIndex}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
                  <div className="bg-[#1D1D1F] text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] max-w-[85%]">
                    {demos[demoIndex].user}
                  </div>
                </motion.div>
              </AnimatePresence>
              <AnimatePresence>
                {showAnswer && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="text-[13px] text-[#1D1D1F] leading-relaxed max-w-[90%]">
                    {demos[demoIndex].vela}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Speaking */}
            <div className="px-5 pb-3 flex items-center gap-1.5 bg-[#FAFAFA]">
              {showAnswer ? (
                <>
                  {[0,1,2,3].map(i => (
                    <motion.div key={i} animate={{ height: ['3px','13px','3px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 rounded-full bg-[#FF9500]" style={{ minHeight: 3 }} />
                  ))}
                  <span className="text-[10px] font-mono text-[#AEAEB2] ml-1.5 uppercase tracking-wider">Speaking</span>
                </>
              ) : (
                <span className="text-[10px] font-mono text-[#D2D2D7]">Thinking...</span>
              )}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 bg-white">
              <div className="flex items-center gap-2 bg-[#F5F5F7] border border-[#E8E8ED] rounded-full px-4 py-2.5">
                <span className="text-[13px] text-[#AEAEB2] flex-1">Ask your wallet anything...</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[#FF9500]">
                  <span className="text-white text-sm font-bold leading-none">↑</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </>
  );
}
