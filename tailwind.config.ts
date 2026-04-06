import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Geist Mono"', 'monospace']
      },
      colors: {
        // Base palette — lavender-inspired
        lavender: {
          50: "#f5f6fc",
          100: "#eef0f8",
          200: "#dde0f3",
          300: "#c5c9f0",
          400: "#a8ace6",
          500: "#8b8fd9",
          600: "#6c6fc4"
        },
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b"
        },
        blue: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e3a8a"
        },
        error: {
          DEFAULT: "#dc2626"
        },
        success: {
          50: "#ecfdf3",
          700: "#15803d"
        }
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem"
      },
      boxShadow: {
        card: "0 2px 12px -2px rgba(0,0,0,0.06)",
        "card-hover": "0 8px 24px -4px rgba(0,0,0,0.1)",
        sidebar: "4px 0 24px -4px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
