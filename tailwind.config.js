/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060a12",
        foreground: "#f8fafc",
        cyber: {
          dark: "#060a12",
          card: "rgba(15, 23, 42, 0.8)",
          border: "rgba(51, 65, 85, 0.9)",
          cyan: "#06b6d4",
          blue: "#3b82f6",
          emerald: "#10b981",
          crimson: "#ef4444",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      animation: {
        "scan-line": "scanline 3s linear infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "radar-sweep": "radar 4s linear infinite",
        shimmer: "shimmer 2.5s infinite",
      },
      keyframes: {
        scanline: {
          "0%": { top: "0%" },
          "50%": { top: "96%" },
          "100%": { top: "0%" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.02)" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};
