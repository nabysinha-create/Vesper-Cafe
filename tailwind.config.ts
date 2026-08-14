import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "near-black": "#120E0B",
        espresso: "#1D140F",
        walnut: "#352319",
        olive: "#30382A",
        "forest-olive": "#475440",
        bronze: "#A87743",
        gold: "#C49A62",
        cream: "#EFE4D3",
        ivory: "#F7F1E8",
        rose: "#A56C68",
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      transitionTimingFunction: {
        vesper: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        drift: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fade-in 1.4s ease forwards",
        drift: "drift 60s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
