import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1B2A4E",
          dark: "#141F3D",
          light: "#2A3B63",
        },
        canvas: "#F4F5F7",
        card: "#FFFFFF",
        ink: {
          DEFAULT: "#111827",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
        line: "#E5E7EB",
        success: {
          DEFAULT: "#16A34A",
          bg: "#EAF7EF",
        },
        danger: {
          DEFAULT: "#DC2626",
          bg: "#FDECEC",
        },
        warn: {
          DEFAULT: "#D97706",
          bg: "#FDF2E3",
        },
      },
      borderRadius: {
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 24, 39, 0.04), 0 1px 8px rgba(17, 24, 39, 0.04)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "Chillax", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
