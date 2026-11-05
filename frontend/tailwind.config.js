/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lime': {
          400: '#a3e635',
          500: '#84cc16',
          neon: '#BFFF00',
        },
        'brand': {
          black: '#000000',
          dark: '#070707',
          darker: '#030303',
          card: '#0e0e0e',
          gray: '#111111',
          'gray-2': '#181818',
          'gray-3': '#242424',
          white: '#ffffff',
          lime: '#BFFF00',
          'lime-dark': '#94c900',
          'lime-glow': 'rgba(191,255,0,0.18)',
          orange: '#FF6B00',
          'orange-light': '#FF8533',
          'orange-glow': 'rgba(255,107,0,0.22)',
          gold: '#FFB800',
          'gold-glow': 'rgba(255,184,0,0.20)',
        }
      },
      fontFamily: {
        'display': ['Bebas Neue', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
        'sport': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.7s ease-out',
        'slide-right': 'slideRight 0.7s ease-out',
        'pulse-lime': 'pulseLime 2s infinite',
        'pulse-orange': 'pulseOrange 2s infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(40px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideRight: { '0%': { transform: 'translateX(-40px)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        pulseLime: { '0%,100%': { boxShadow: '0 0 10px #BFFF00' }, '50%': { boxShadow: '0 0 25px #BFFF00, 0 0 50px #BFFF00' } },
        pulseOrange: { '0%,100%': { boxShadow: '0 0 10px #FF6B00' }, '50%': { boxShadow: '0 0 25px #FF6B00, 0 0 50px #FF6B00' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow: { '0%': { textShadow: '0 0 10px #BFFF00' }, '100%': { textShadow: '0 0 20px #BFFF00, 0 0 40px #BFFF00' } },
      },
      backgroundImage: {
        'gradient-sports': 'linear-gradient(135deg, #FF6B00 0%, #FFB800 45%, #BFFF00 100%)',
        'gradient-orange': 'linear-gradient(135deg, #FF6B00 0%, #FF9900 100%)',
        'gradient-lime': 'linear-gradient(135deg, #BFFF00 0%, #84cc16 100%)',
        'gradient-dark': 'linear-gradient(180deg, #030303 0%, #0d0d0d 100%)',
        'gradient-hero': 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(5,5,5,0.95) 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(20,20,20,0.7) 0%, rgba(10,10,10,0.95) 100%)',
      },
      boxShadow: {
        'lime': '0 0 20px rgba(191,255,0,0.3)',
        'lime-lg': '0 0 45px rgba(191,255,0,0.45)',
        'orange': '0 0 20px rgba(255,107,0,0.35)',
        'orange-lg': '0 0 45px rgba(255,107,0,0.5)',
        'sports': '0 0 30px rgba(255,107,0,0.25), 0 0 30px rgba(191,255,0,0.25)',
        'card': '0 8px 30px rgba(0,0,0,0.7)',
        'card-hover': '0 14px 45px rgba(0,0,0,0.9)',
      }
    },
  },
  plugins: [],
}
