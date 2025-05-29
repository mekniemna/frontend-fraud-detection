/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        dark: '#111827',
        'dark-light': '#1F2937',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
}
