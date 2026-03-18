/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f7f8f3",
          100: "#eef0e6",
          200: "#d5dbc3",
          300: "#b5c093",
          400: "#9aaa6e",
          500: "#7d9150",
          600: "#6b7d3f",
          700: "#526134",
          800: "#434f2d",
          900: "#3a4428",
          950: "#1d2413",
        },
        brand: {
          primary: "#9bce26", // 브랜드 그린
          secondary: "#1a1a1a",
          accent: "#ff6b35",
          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#3b82f6",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "-apple-system", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounceSubtle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
    },
  },
  plugins: [],
};
