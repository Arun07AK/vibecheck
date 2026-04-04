/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        surface: '#1e293b',
        teal: '#2dd4bf',
        yellow: '#fbbf24',
      }
    }
  },
  plugins: []
};
