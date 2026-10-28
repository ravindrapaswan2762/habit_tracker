/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#5B4DFC',
          600: '#4F46E5',
          700: '#4338CA',
        },
        pastel: {
          blue: '#EBF3FE',
          'blue-border': '#C8DCFB',
          pink: '#FFE8EC',
          'pink-border': '#FFCCD8',
          yellow: '#FEF6D8',
          'yellow-border': '#FDE89C',
          green: '#E4F9ED',
          'green-border': '#BAEED0',
          purple: '#F2EDFE',
          'purple-border': '#DDD3FD',
        }
      }
    },
  },
  plugins: [],
}
