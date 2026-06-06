'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VelaMascot from '../dashboard/VelaMascot';
import Button from '../ui/Button';
import ConnectWallet from '../ui/ConnectWallet';
import { useRouter } from 'next/navigation';

const demos = [
  {
    user: 'What is my biggest losing position?',
    vela: (
      <>Your ARB position is down <span className="font-mono text-[#FF9500] font-medium">18.3%</span> (<span className="font-mono text-[#FF9500] font-medium">$847</span>) since entry. It also carries the highest ETH correlation in your portfolio.</>
    ),
  },
  {
    user: 'How concentrated am I?',
    vela: (
      <>Your top 3 positions represent <span className="font-mono text-[#FF9500] font-medium">73%</span> of total value — ETH at <span className="font-mono text-[#FF9500] font-medium">48%</span>, ARB at <span className="font-mono text-[#FF9500] font-medium">23%</span>, USDC at <span className="font-mono text-[#FF9500] font-medium">15%</span>.</>
    ),
  },
  {
    user: 'If ETH drops 30%, what happens?',
    vela: (
      <>Your portfolio loses roughly <span className="font-mono text-[#FF9500] font-medium">$14,200</span>. ARB takes the hardest hit due to its <span className="font-mono text-[#FF9500] font-medium">87%</span> correlation with ETH.</>
    ),
  },
];

export default function Hero() {
  const router = useRouter();
  const [demoIndex, setDemoIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowAnswer(true), 1500);
    const t2 = setTimeout(() => {
      setShowAnswer(false);
      setTimeout(() => {
        setDemoIndex(i => (i + 1) % demos.length);
        setShowAnswer(true);
      }, 400);
    }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [demoIndex]);

  const handleConnect = (address: string, chainType: 'evm' | 'solana') => {
    localStorage.setItem('vela_address', address);
    localStorage.setItem('vela_chain', chainType);
    router.push('/dashboard');
  };

  return (
    <>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-14 border-b border-[#F5F5F7] bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <VelaMascot size={26} />
          <span className="font-semibold text-[#1D1D1F] text-[15px] tracking-tight">
            Vela<span className="text-[#FF9500]">.</span>
          </span>
        </div>
        <button
          onClick={() => setShowWalletConnect(true)}
          className="text-[13px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          Connect wallet →
        </button>
      </nav>

      <section className="min-h-[88vh] flex items-center px-6 md:px-12 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-16 w-full items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F5F5F7] border border-[#E5E5EA] rounded-full px-3 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
              <span className="text-[11px] font-mono text-[#6E6E73] uppercase tracking-wider">EVM + Solana · Voice-first</span>
            </div>

            <h1 className="text-[56px] md:text-[72px] font-semibold tracking-[-0.03em] leading-[1.0] text-[#1D1D1F] mb-6">
              Your portfolio,<br />
              <span className="text-[#AEAEB2]">answering back</span><span className="text-[#FF9500]">.</span>
            </h1>

            <p className="text-[17px] text-[#6E6E73] max-w-[420px] leading-relaxed mb-8">
              Connect your wallet. Ask anything out loud. Vela reads your positions across Ethereum, Arbitrum, and Solana and explains them like a sharp analyst.
            </p>

            {showWalletConnect ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <ConnectWallet onConnect={handleConnect} />
              </motion.div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => setShowWalletConnect(true)}>Get started</Button>
                <Button variant="secondary" disabled>Hear a demo</Button>
              </div>
            )}
          </div>

          {/* Right — chat mockup */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
            className="bg-white border border-[#E5E5EA] rounded-2xl overflow-hidden shadow-elevated"
          >
            {/* Window chrome */}
            <div className="flex items-center px-4 py-3 border-b border-[#F5F5F7] bg-[#F5F5F7]/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <span className="flex-1 text-center text-[11px] font-mono text-[#AEAEB2]">vela — portfolio chat</span>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2.5 mb-5">
                <VelaMascot size={32} speaking={showAnswer} />
                <div>
                  <div className="text-[13px] font-semibold text-[#1D1D1F]">Vela</div>
                  <div className="text-[11px] font-mono text-[#AEAEB2]">Portfolio Intelligence</div>
                </div>
              </div>

              <div className="space-y-3 min-h-[160px]">
                <motion.div
                  key={`user-${demoIndex}`}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-end"
                >
                  <div className="bg-[#1D1D1F] rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] text-white max-w-[80%]">
                    {demos[demoIndex].user}
                  </div>
                </motion.div>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[13px] text-[#1D1D1F] leading-relaxed max-w-[90%]"
                  >
                    {demos[demoIndex].vela}
                  </motion.div>
                )}
              </div>

              {showAnswer && (
                <div className="flex gap-1 items-center mt-4">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: ['3px', '12px', '3px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                      className="w-1 bg-[#FF9500] rounded-full"
                      style={{ minHeight: '3px' }}
                    />
                  ))}
                  <span className="text-[11px] font-mono text-[#AEAEB2] ml-2 uppercase tracking-wider">Speaking</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
