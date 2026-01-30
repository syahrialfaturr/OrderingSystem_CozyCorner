/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ed',
          100: '#fdedd3',
          200: '#fbd8a5',
          300: '#f8bc6d',
          400: '#f59e33',
          500: '#f2810c',
          600: '#e36607',
          700: '#bc4c0a',
          800: '#963d0f',
          900: '#793410',
        },
        coffee: {
          50: '#faf5f0',
          100: '#f4e8db',
          200: '#e8d0b7',
          300: '#d9b088',
          400: '#c88d5c',
          500: '#ba7544',
          600: '#ac6039',
          700: '#8f4d31',
          800: '#75402d',
          900: '#613728',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
