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
      <>Your ARB position is down <span className="font-mono text-amber-400">18.3%</span> (<span className="font-mono text-amber-400">$847</span>) since you opened it. It is also your most ETH-correlated hold.</>
    ),
  },
  {
    user: 'How concentrated am I?',
    vela: (
      <>Your top 3 positions make up <span className="font-mono text-amber-400">73%</span> of total value. ETH at <span className="font-mono text-amber-400">48%</span>, ARB at <span className="font-mono text-amber-400">23%</span>, USDC at <span className="font-mono text-amber-400">15%</span>.</>
    ),
  },
  {
    user: 'If ETH drops 30%, what happens?',
    vela: (
      <>Your portfolio drops roughly <span className="font-mono text-amber-400">$14,200</span>. ARB takes the hardest hit due to <span className="font-mono text-amber-400">87%</span> correlation with ETH.</>
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
    <section className="min-h-screen flex items-center px-8 md:px-16 py-16 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-16 w-full items-center">
        {/* Left */}
        <div className="relative">
          {/* Subtle radial glow behind text */}
          <div className="absolute -z-10 -top-12 -left-12 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />

          <div className="flex items-center gap-2 mb-8">
            <VelaMascot size={32} />
            <span className="font-semibold tracking-tighter text-zinc-50 text-xl">
              VELA<span className="text-amber-500">.</span>
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl tracking-tighter font-semibold leading-none text-zinc-50 mb-6">
            Your portfolio,<br />
            <span className="text-amber-400">answering back.</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-md leading-relaxed mb-8">
            Connect your wallet. Ask anything out loud. Vela reads your positions across Ethereum, Base, Arbitrum, and Solana and explains them like a sharp analyst.
          </p>
          {showWalletConnect ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ConnectWallet onConnect={handleConnect} />
            </motion.div>
          ) : (
            <div className="flex gap-3">
              <Button onClick={() => setShowWalletConnect(true)}>Connect Wallet</Button>
              <Button variant="secondary" className="opacity-60 cursor-not-allowed">Hear a demo</Button>
            </div>
          )}
        </div>

        {/* Right - Chat mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 ring-1 ring-amber-500/10 rounded-2xl overflow-hidden relative"
        >
          {/* Window chrome header */}
          <div className="flex items-center px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            </div>
            <span className="flex-1 text-center text-[10px] font-mono text-zinc-600 tracking-wider">vela — portfolio chat</span>
          </div>

          <div className="p-6 relative">
            <div className="absolute top-4 left-4">
              <VelaMascot size={28} speaking={showAnswer} />
            </div>
            <div className="mt-10 space-y-4 min-h-[180px]">
              <motion.div
                key={`user-${demoIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-end"
              >
                <div className="bg-zinc-800 rounded-2xl rounded-tr-sm px-4 py-2 text-sm text-zinc-200 max-w-[80%]">
                  {demos[demoIndex].user}
                </div>
              </motion.div>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-2"
                >
                  <div className="text-sm text-zinc-300 leading-relaxed">
                    {demos[demoIndex].vela}
                  </div>
                </motion.div>
              )}
            </div>
            {showAnswer && (
              <div className="flex gap-1 items-end h-4 mt-3">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: ['4px', '14px', '4px'] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                    className="w-1 bg-amber-500 rounded-full"
                    style={{ minHeight: '4px' }}
                  />
                ))}
                <span className="text-xs text-zinc-600 ml-1">Speaking</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
