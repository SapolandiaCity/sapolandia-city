import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#04060f', 900: '#070b18', 800: '#0b1224' },
        navy: { 600: '#16233f' },
        brand: { DEFAULT: '#12d17a', 600: '#0fae66', 300: '#5cf0ab' },
        gold: { DEFAULT: '#e8c56a', 600: '#c9a44a' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Sora', 'Inter', 'sans-serif'] },
      boxShadow: { glow: '0 0 40px -10px rgba(18,209,122,.45)' },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pop: { '0%': { transform: 'scale(.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
      },
      animation: { float: 'float 6s ease-in-out infinite', pop: 'pop .25s ease-out' },
    },
  },
  plugins: [],
} satisfies Config
