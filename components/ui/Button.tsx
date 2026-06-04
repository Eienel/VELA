'use client';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function Button({ children, onClick, variant = 'primary', className = '' }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold text-sm transition-colors ${
        variant === 'primary'
          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
