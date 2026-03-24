import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f8f2",
          100: "#e9efdc",
          200: "#d1deb7",
          300: "#aebf7d",
          400: "#8fa355",
          500: "#70813a",
          600: "#596730",
          700: "#454f28",
          800: "#32391f",
          900: "#1e2415"
        }
      },
      fontFamily: {
        sans: ["Avenir Next", "Trebuchet MS", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        card: "0 20px 50px rgba(24, 32, 20, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
