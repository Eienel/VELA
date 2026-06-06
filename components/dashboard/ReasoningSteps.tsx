'use client';
import { motion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';

const steps = [
  'Fetching your positions from MongoDB...',
  'Analyzing correlations...',
  'Generating insight...',
];

interface Props {
  activeStep: number;
}

export default function ReasoningSteps({ activeStep }: Props) {
  return (
    <div className="flex flex-col gap-1.5 py-3 px-4 my-2 rounded-xl bg-zinc-900/40 border border-zinc-800/50 mx-0">
      {steps.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.4, duration: 0.3 }}
          className="flex items-center gap-2 text-xs text-zinc-500"
        >
          {activeStep > i ? (
            <Check size={12} color="#22c55e" weight="bold" />
          ) : activeStep === i ? (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-amber-500"
            />
          ) : (
            <div className="w-2 h-2 rounded-full bg-zinc-700" />
          )}
          <span className={activeStep > i ? 'text-zinc-600 line-through' : activeStep === i ? 'text-zinc-400' : 'text-zinc-600'}>
            {step}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
