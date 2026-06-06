import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: '#FF9500',
        'accent-bright': '#FFB340',
        positive: '#34C759',
        negative: '#FF3B30',
        surface: '#FFFFFF',
        'surface-secondary': '#F5F5F7',
        border: '#D2D2D7',
        muted: '#6E6E73',
        'text-primary': '#1D1D1F',
        'text-secondary': '#6E6E73',
        'text-tertiary': '#AEAEB2',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', '"Menlo"', '"Monaco"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'panel': '0 2px 8px rgba(0,0,0,0.06)',
        'elevated': '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
