/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          heading: ['Outfit', 'sans-serif'],
          body: ['"Plus Jakarta Sans"', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }