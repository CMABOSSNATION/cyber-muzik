module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#e8640a', dark: '#c95408' },
        ink: { 950: '#09090b', 900: '#111114', 800: '#18181c', 700: '#222227', 600: '#32323a' },
      },
    },
  },
  plugins: [],
};
