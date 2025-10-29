/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uniwikicolor: "#2c80a0",
        uniwikicolor_hover: "#256b86",
      },
    },
  },
  plugins: [],
}
