/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          900: '#2B1D16', // Deep Chocolate
          800: '#3A261C', // Dark Brown
          600: '#6F4E37', // Primary Brown
          500: '#8B5E3C', // Medium Brown
          400: '#A97852', // Light Brown
        },
        cream: {
          DEFAULT: '#FFF8F0',
          warm: '#F7EBDD',
        },
        beige: {
          DEFAULT: '#EAD8C5',
          sand: '#DCC2A8',
        },
        terracotta: {
          DEFAULT: '#B86B45',
          accent: '#C98B5B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
