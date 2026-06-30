/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./public/js/**/*.js"
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
