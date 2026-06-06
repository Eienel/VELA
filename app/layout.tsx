import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'VELA - Portfolio Intelligence',
  description: 'Conversational AI agent for crypto portfolio intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
