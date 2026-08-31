/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eefbf6",
          100: "#d6f7ea",
          400: "#36d399",
          500: "#10b981",
          600: "#059669",
        },
        sui: {
          light: "#4da2ff",
          DEFAULT: "#2a82e4",
          dark: "#1e60a5",
        },
        gonka: {
          light: "#c084fc",
          DEFAULT: "#a855f7",
          dark: "#7e22ce",
        }
      },
      fontFamily: {
        mono: ["var(--font-roboto-mono)", "monospace", "ui-monospace"],
        sans: ["var(--font-inter)", "sans-serif", "ui-sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(54, 211, 153, 0.3)",
        "glow-sui": "0 0 20px -5px rgba(77, 162, 255, 0.3)",
        "glow-gonka": "0 0 20px -5px rgba(168, 85, 247, 0.3)",
      }
    },
  },
  plugins: [],
};
