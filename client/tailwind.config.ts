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
        themePrimary: 'var(--theme-primary, #FF6B00)',
        themeSecondary: 'var(--theme-secondary, #1e293b)',
        themeBg: 'var(--theme-bg, #f8fafc)',
        themeSidebar: 'var(--theme-sidebar, #ffffff)',
        themeHeader: 'var(--theme-header, #ffffff)',
        themeCard: 'var(--theme-card, #ffffff)',
        themeText: 'var(--theme-text, #0f172a)',
        themeBorder: 'var(--theme-border, #e2e8f0)',
        themeHover: 'var(--theme-hover, #f1f5f9)',
        themeButton: 'var(--theme-button, #FF6B00)',
        themeButtonText: 'var(--theme-button-text, #ffffff)',
        themeSuccess: 'var(--theme-success, #10b981)',
        themeWarning: 'var(--theme-warning, #f59e0b)',
        themeError: 'var(--theme-error, #ef4444)',
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36a9f6',
          500: '#0c8de4',
          600: '#026fc2',
          700: '#03589e',
          800: '#074b82',
          900: '#0c3f6d',
          950: '#082848',
        },
      },
    },
  },
  plugins: [],
};
export default config;
