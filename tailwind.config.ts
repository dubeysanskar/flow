import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        flow: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        surface: {
          DEFAULT: "#0f111a",
          dark: "#060710",
          card: "#10131f",
          border: "#1e2437",
          highlight: "#181c2e",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave": "wave 1.5s ease-in-out infinite alternate",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        wave: {
          "0%": { height: "15%" },
          "100%": { height: "100%" },
        },
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.4)" },
          "100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
