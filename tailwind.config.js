/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

module.exports = {
  darkMode: 'class', // <--- CHANGE THIS (It usually says 'media' or is missing)
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
}