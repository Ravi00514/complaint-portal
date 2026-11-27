/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        govBlue: {
          50: '#f2f7fc',
          100: '#e1eef8',
          200: '#c7def2',
          300: '#9ec7e9',
          400: '#6ea6dc',
          500: '#4a87cc',
          600: '#366cb9',
          700: '#1e4b8f', // Main brand primary
          800: '#1d4077',
          900: '#1b3762',
          950: '#112240',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
