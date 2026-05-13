import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      borderRadius: {
        bubble: "1.5rem",
        card: "2rem",
        "3xl": "1.75rem",
        "4xl": "2rem"
      },
      colors: {
        ink: "#1e293b",
        mist: "#f8fafc",
        fern: "#10b981", // Modern soft green
        "fern-light": "#d1fae5",
        "fern-dark": "#059669",
        surface: "#ffffff",
        background: "#f1f5f9",
        muted: "#64748b",
        border: "#e2e8f0"
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.02)",
        cute: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        bubble: "0 2px 5px rgba(0, 0, 0, 0.03)"
      },
      padding: {
        safe: "env(safe-area-inset-bottom)"
      },
      spacing: {
        "safe-area-inset": "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)"
      }
    }
  },
  plugins: []
};

export default config;
