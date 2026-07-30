import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
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
