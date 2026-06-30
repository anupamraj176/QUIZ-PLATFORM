/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/index.html",
    "./frontend/src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f8fafc',
          dark: '#0f172a',
          accent: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
