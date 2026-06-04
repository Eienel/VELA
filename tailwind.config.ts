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
        accent: '#f59e0b',
        'accent-bright': '#fbbf24',
        positive: '#22c55e',
        negative: '#ef4444',
        surface: '#18181b',
        border: '#27272a',
        muted: '#71717a',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', '"Cascadia Code"', '"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
