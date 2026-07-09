import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#071013",
        graphite: "#1d2528",
        mint: "#35e0a1",
        amber: "#f2b84b",
        ice: "#d9f7ff"
      },
      boxShadow: {
        glow: "0 0 44px rgba(53, 224, 161, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
