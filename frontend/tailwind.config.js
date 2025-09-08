
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#62d394",
          dark: "#2aa76b"
        }
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.25)"
      }
    },
  },
  plugins: [],
}
