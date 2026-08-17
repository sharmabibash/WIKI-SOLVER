/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-elevated': '#1e293b',
        'surface-border': '#334155',
        forward: {
          light: '#38bdf8',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
          glow: 'rgba(56, 189, 248, 0.4)'
        },
        backward: {
          light: '#c084fc',
          DEFAULT: '#9333ea',
          dark: '#7e22ce',
          glow: 'rgba(192, 132, 252, 0.4)'
        },
        collision: {
          light: '#fde047',
          DEFAULT: '#eab308',
          dark: '#ca8a04',
          glow: 'rgba(250, 204, 21, 0.5)'
        },
        target: {
          light: '#f43f5e',
          DEFAULT: '#e11d48',
          dark: '#be123c',
          glow: 'rgba(244, 63, 94, 0.4)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(56, 189, 248, 0.2), inset 0 0 10px rgba(56, 189, 248, 0.1)' },
          '100%': { boxShadow: '0 0 25px rgba(56, 189, 248, 0.6), inset 0 0 15px rgba(56, 189, 248, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
