/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The whole palette. Nothing outside this list should appear in the UI.
        page: "#FAFAF9",
        surface: "#FFFFFF",
        line: "#E7E5E4",
        "line-strong": "#D6D3D1",
        ink: "#1C1917",
        "ink-soft": "#57534E",
        "ink-faint": "#A8A29E",
        action: "#1C1917",
        "action-hover": "#292524",
        accent: "#2563EB",
        success: "#15803D",
        warning: "#B45309",
        danger: "#B91C1C",
      },
      fontFamily: {
        // Self-contained stacks. Nothing is fetched at build time, so a bad
        // network at the venue cannot break the build or the fonts.
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        small: ["13px", "20px"],
        body: ["15px", "24px"],
        "card-title": ["16px", "24px"],
        section: ["22px", "30px"],
        "page-title": ["30px", "38px"],
        hero: ["48px", "56px"],
      },
      borderRadius: {
        input: "4px",
        DEFAULT: "6px",
        card: "6px",
      },
      boxShadow: {
        // The only shadow in the system. Borders do the work instead.
        subtle: "0 1px 2px rgba(0,0,0,0.04)",
      },
      maxWidth: {
        content: "1120px",
      },
    },
  },
  plugins: [],
};
