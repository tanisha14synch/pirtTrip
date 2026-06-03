/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#F3A81A',
          'gold-hover': '#E09910',
          dark: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Plein', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        plein: ['Plein', 'Plus Jakarta Sans', 'ui-sans-serif', 'sans-serif'],
        poppins: ['Poppins', 'Plus Jakarta Sans', 'ui-sans-serif', 'sans-serif'],
        inter: ['Inter', 'Plus Jakarta Sans', 'ui-sans-serif', 'sans-serif'],
      },
      fontSize: {
        'header-nav': ['16px', { lineHeight: '140%' }],
      },
      boxShadow: {
        search: '0 8px 40px rgba(0, 0, 0, 0.12)',
        deal: '0 2px 12px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
