/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#F76517',
          'primary-dark': '#E55510',
          gold: '#F3A81A',
          'gold-dark': '#E2980B',
          red: '#F76517',
          'red-dark': '#E55510',
        },
      },
    },
  },
  plugins: [],
}
