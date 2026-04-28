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
        bg: {
          primary: "rgb(var(--bg-primary) / <alpha-value>)",
          secondary: "rgb(var(--bg-secondary) / <alpha-value>)",
          card: "rgb(var(--bg-card) / <alpha-value>)",
          elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          subtle: "rgb(var(--border-subtle) / <alpha-value>)",
        },
        accent: {
          purple: "rgb(var(--accent-purple) / <alpha-value>)",
          blue: "rgb(var(--accent-blue) / <alpha-value>)",
          cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
          pink: "rgb(var(--accent-pink) / <alpha-value>)",
        },
      },
      backgroundImage: {
        "gradient-aurora":
          "linear-gradient(135deg, rgb(var(--accent-purple)) 0%, rgb(var(--accent-blue)) 50%, rgb(var(--accent-cyan)) 100%)",
        "gradient-card":
          "linear-gradient(180deg, rgb(var(--accent-purple) / 0.08) 0%, rgb(var(--accent-blue) / 0.04) 100%)",
        "gradient-sunset":
          "linear-gradient(135deg, rgb(var(--accent-pink)) 0%, rgb(var(--accent-purple)) 100%)",
        "gradient-mesh":
          "radial-gradient(at 27% 37%, rgb(var(--accent-purple) / 0.18) 0px, transparent 50%), radial-gradient(at 97% 21%, rgb(var(--accent-blue) / 0.12) 0px, transparent 50%), radial-gradient(at 52% 99%, rgb(var(--accent-cyan) / 0.10) 0px, transparent 50%)",
      },
      boxShadow: {
        glow: "0 0 32px rgb(var(--accent-purple) / 0.35)",
        "glow-blue": "0 0 32px rgb(var(--accent-blue) / 0.35)",
        card: "0 4px 24px rgb(0 0 0 / 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [],
};
