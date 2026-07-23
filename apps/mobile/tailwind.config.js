/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "media",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Semantic accents (Fase 4 "design tokens"). Same hue in light/dark —
        // these are accent colors, not surfaces, so they don't need a dark variant.
        // brand/accent sampled directly from the CyberFort logo (blue/orange globe).
        brand: {
          50: "#EFF5FF",
          100: "#DCEBFF",
          200: "#B9D6FF",
          300: "#86B8FF",
          400: "#4D93FF",
          500: "#1F71F5",
          600: "#065FCE",
          700: "#054AA3",
          800: "#073B7E",
          900: "#0A2F5C",
        },
        accent: {
          50: "#FFF4EC",
          100: "#FFE3CC",
          200: "#FFC79A",
          300: "#FFA35F",
          400: "#FF8935",
          500: "#FE7A1F",
          600: "#FE6D0F",
          700: "#D6560A",
          800: "#A8420C",
          900: "#7A320D",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
      },
    },
  },
  plugins: [],
};
