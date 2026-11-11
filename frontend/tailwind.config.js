/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f8f3',
          100: '#dcefe2',
          200: '#b9dfc6',
          300: '#8bc9a2',
          400: '#57ab78',
          500: '#348d58',
          600: '#247146',
          700: '#1e5a3a',
          800: '#1a4830',
          900: '#163c29',
          950: '#0b2116',
        },
        earth: {
          50: '#faf6ef',
          100: '#f1e8d8',
          200: '#e2d1b3',
          300: '#cfb387',
          400: '#b9935f',
          500: '#a57b45',
          600: '#8a6238',
          700: '#6f4c30',
          800: '#5c402b',
          900: '#4d3626',
        },
        cream: '#faf8f2',
        ink: '#1f2a24',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(22, 60, 41, 0.04), 0 18px 40px -28px rgba(22, 60, 41, 0.35)',
        lift: '0 2px 6px rgba(22, 60, 41, 0.06), 0 24px 50px -30px rgba(22, 60, 41, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-in': 'slide-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};
