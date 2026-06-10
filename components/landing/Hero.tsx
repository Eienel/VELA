'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VelaMascot from '../dashboard/VelaMascot';
import ConnectWallet from '../ui/ConnectWallet';
import { useRouter } from 'next/navigation';

const demos = [
  {
    user: 'If ETH drops 30%, what happens?',
    vela: <>Portfolio drops roughly <span className="font-mono font-semibold text-[#3056D7]">$14,200</span>. ARB takes the hardest hit — <span className="font-mono font-semibold text-[#3056D7]">87%</span> correlated to ETH.</>,
  },
  {
    user: 'How concentrated am I?',
    vela: <>Top 3 positions make up <span className="font-mono font-semibold text-[#3056D7]">73%</span> of your value. ETH at <span className="font-mono font-semibold text-[#3056D7]">48%</span>, ARB at <span className="font-mono font-semibold text-[#3056D7]">23%</span>.</>,
  },
  {
    user: "What's my worst position right now?",
    vela: <>ARB is down <span className="font-mono font-semibold text-[#3056D7]">18.3%</span> since entry — <span className="font-mono font-semibold text-[#3056D7]">$847</span> in the red. Your highest-risk hold.</>,
  },
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

  const handleConnect = (address: string, chainType: 'evm' | 'solana', specificChain?: string) => {
    localStorage.setItem('vela_address', address);
    localStorage.setItem('vela_chain', specificChain || chainType);
    router.push('/dashboard');
  };

  return (
    <>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#E8E8ED]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-2.5">
            <VelaMascot size={26} />
            <span className="font-semibold text-[#1D1D1F] text-[15px] tracking-tight">
              Vela<span className="text-[#3056D7]">.</span>
            </span>
          </div>
          <button
            onClick={() => setShowConnect(true)}
            className="text-[13px] font-semibold text-[#1D1D1F] hover:text-[#3056D7] transition-colors"
          >
            Get started →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 md:pb-24 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16 items-center">

        {/* Left */}
        <div>
          <p className="text-[11px] md:text-[12px] font-mono text-[#AEAEB2] uppercase tracking-[0.2em] mb-5 md:mb-6">
            Portfolio Intelligence · ETH · Base · Arbitrum · Solana
          </p>

          <h1 className="text-[42px] sm:text-[56px] md:text-[72px] font-bold tracking-[-0.04em] leading-[1.0] mb-6">
            <span className="text-[#1D1D1F]">Your wallet,</span><br />
            <span className="text-[#B0B0B5]">answering back.</span>
          </h1>

          <p className="text-[17px] text-[#6E6E73] leading-relaxed max-w-[400px] mb-10">
            Paste any wallet address. Vela reads your on-chain positions and talks you through them in real voice — mood included.
          </p>

          <AnimatePresence mode="wait">
            {showConnect ? (
              <motion.div key="wc" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ConnectWallet onConnect={handleConnect} />
              </motion.div>
            ) : (
              <motion.div key="cta" className="flex gap-3" exit={{ opacity: 0 }}>
                <button
                  onClick={() => setShowConnect(true)}
                  className="bg-[#1D1D1F] text-white font-semibold text-[15px] px-6 py-3 rounded-full transition-colors active:scale-[0.97] hover:bg-[#3056D7]"
                >
                  Try your wallet
                </button>
                <button disabled className="border border-[#E8E8ED] text-[#AEAEB2] font-semibold text-[15px] px-6 py-3 rounded-full cursor-not-allowed">
                  Hear a demo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — chat card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="border border-[#E8E8ED] rounded-2xl overflow-hidden bg-white"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          {/* Chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F9F9FB] border-b border-[#E8E8ED]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            <span className="flex-1 text-center text-[11px] font-mono text-[#AEAEB2]">vela — portfolio chat</span>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 min-h-[190px] bg-[#FAFAFA]">
            <AnimatePresence mode="wait">
              <motion.div key={`u-${demoIndex}`} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
                <div className="bg-[#1D1D1F] text-white rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] max-w-[85%] leading-relaxed">
                  {demos[demoIndex].user}
                </div>
              </motion.div>
            </AnimatePresence>
            <AnimatePresence>
              {showAnswer && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-[13px] text-[#1D1D1F] leading-relaxed max-w-[90%]">
                  {demos[demoIndex].vela}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Speaking indicator */}
          <div className="px-5 pb-3 flex items-center gap-1.5 bg-[#FAFAFA]">
            {showAnswer ? (
              <>
                {[0,1,2,3].map(i => (
                  <motion.div key={i}
                    animate={{ height: ['3px','12px','3px'] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 rounded-full bg-[#1D1D1F]" style={{ minHeight: 3 }} />
                ))}
                <span className="text-[10px] font-mono text-[#AEAEB2] ml-1 uppercase tracking-wider">Speaking</span>
              </>
            ) : (
              <span className="text-[10px] font-mono text-[#D2D2D7]">Listening...</span>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 bg-white">
            <div className="flex items-center gap-2 bg-[#F5F5F7] border border-[#E8E8ED] rounded-full px-4 py-2.5">
              <span className="text-[13px] text-[#AEAEB2] flex-1">Ask your wallet anything...</span>
              <div className="w-7 h-7 rounded-full bg-[#3056D7] flex items-center justify-center">
                <span className="text-white text-[13px] font-bold leading-none">↑</span>
              </div>
            </div>
          </div>
        </motion.div>

      </section>
    </>
  );
}
