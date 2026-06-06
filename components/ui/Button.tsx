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
      className={`px-5 py-2.5 rounded-full font-semibold text-[14px] transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
        variant === 'primary'
          ? 'bg-[#1D1D1F] hover:bg-[#3D3D3F] text-white shadow-card'
          : 'border border-[#D2D2D7] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]'
      } ${className}`}
    >
      {children}
    </button>
  );
}
