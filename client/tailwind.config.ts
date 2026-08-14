import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['22px', { lineHeight: '30px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['36px', { lineHeight: '44px' }],
        '4xl': ['48px', { lineHeight: '56px' }],
        '13px': ['13px', { lineHeight: '18px' }],
        '15px': ['15px', { lineHeight: '22px' }],
      },
      keyframes: {
        'slide-up-spring': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '60%': { opacity: '1', transform: 'translateY(-4px) scale(1.01)' },
          '80%': { transform: 'translateY(2px) scale(0.995)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'slide-down-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
        },
        'fab-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'slide-up-spring': 'slide-up-spring 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'slide-down-out': 'slide-down-out 0.25s ease-in forwards',
        'fab-bounce': 'fab-bounce 2s ease-in-out infinite',
      },
      colors: {
        themePrimary: 'var(--theme-primary, #1B664B)',
        themeSecondary: 'var(--theme-secondary, #14523C)',
        themeBg: 'var(--theme-bg, #E8F5F0)',
        themeSidebar: 'var(--theme-sidebar, #ffffff)',
        themeHeader: 'var(--theme-header, #ffffff)',
        themeCard: 'var(--theme-card, #ffffff)',
        themeText: 'var(--theme-text, #17211B)',
        themeBorder: 'var(--theme-border, #D1EBE1)',
        themeHover: 'var(--theme-hover, #14523C)',
        themeButton: 'var(--theme-button, #1B664B)',
        themeButtonText: 'var(--theme-button-text, #ffffff)',
        themeSuccess: 'var(--theme-success, #1B664B)',
        themeWarning: 'var(--theme-warning, #f59e0b)',
        themeError: 'var(--theme-error, #ef4444)',
        brand: {
          50: '#E8F5F0',
          100: '#D1EBE1',
          200: '#A4D7C3',
          300: '#76C3A5',
          400: '#49AF87',
          500: '#239B6F',
          600: '#1B664B',
          700: '#14523C',
          800: '#0F402E',
          900: '#0A2D20',
          950: '#051A12',
        },
      },
    },
  },
  plugins: [],
};
export default config;
