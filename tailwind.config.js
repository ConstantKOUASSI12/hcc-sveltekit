/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        hcc: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a5b8ff',
          400: '#818dff',
          500: '#6366f1',
          600: '#1a2b6b',   // primary dark blue
          700: '#152258',
          800: '#0f1a45',
          900: '#0a1133',
          950: '#060b22',
        },
        accent: {
          400: '#f59e0b',
          500: '#e8930a',
          600: '#d97706',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card':  '0 2px 16px 0 rgba(26,43,107,0.08)',
        'glow':  '0 0 24px rgba(99,102,241,0.3)',
      },
      backgroundImage: {
        'gradient-hcc': 'linear-gradient(135deg, #1a2b6b 0%, #0f1a45 100%)',
      }
    },
  },
  plugins: [],
};
