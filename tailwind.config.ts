import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#16425b', foreground: '#ffffff', hover: '#1a5270' },
        secondary: { DEFAULT: '#2d6a8e' },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
