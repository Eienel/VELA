'use client';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-none font-semibold text-sm transition-transform active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${
        variant === 'primary'
          ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
          : 'border border-zinc-700 bg-transparent text-zinc-300 hover:border-zinc-500'
      } ${className}`}
    >
      {children}
    </button>
  );
}
