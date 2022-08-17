/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {      
      colors: {
        'white': '#ffffff',
        'purple': '#3f3cbb',
      }
    },
  },
  plugins: [],
}
