/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1E1E1E',
        surface: '#262626',
        border: '#333333',
        cyan: '#00F0FF',
        critical: '#FF3B30',
        high: '#FF9500',
        medium: '#FFD60A',
        dim: '#888888',
        terminal: '#0D1117',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      }
    }
  },
  plugins: []
};
