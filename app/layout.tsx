import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vela — Portfolio Intelligence',
  description: 'Conversational AI agent for crypto portfolio intelligence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
