/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
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
