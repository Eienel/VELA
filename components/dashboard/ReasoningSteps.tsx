'use client';
import { motion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';

const steps = [
  'Fetching positions from MongoDB...',
  'Analyzing correlations...',
  'Generating insight...',
];

interface Props {
  activeStep: number;
}

export default function ReasoningSteps({ activeStep }: Props) {
  return (
    <div className="flex flex-col gap-1.5 py-3 px-4 my-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
      {steps.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.35, duration: 0.25 }}
          className="flex items-center gap-2 text-[12px] font-mono"
        >
          {activeStep > i ? (
            <Check size={11} color="#34C759" weight="bold" />
          ) : activeStep === i ? (
            <div className="w-1.5 h-1.5 rounded-full bg-[#1D1D1F]" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-[#D2D2D7]" />
          )}
          <span className={
            activeStep > i
              ? 'text-[#AEAEB2] line-through'
              : activeStep === i
              ? 'text-[#1D1D1F]'
              : 'text-[#AEAEB2]'
          }>
            {step}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
