import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050505",
        ember: "#9f1118",
        blood: "#c1121f",
        bone: "#f5f0ea",
        asphalt: "#121212",
        citron: "#c1121f",
        lagoon: "#f5f0ea"
      },
      fontFamily: {
        sans: ["var(--font-hebrew)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(159, 17, 24, 0.26)"
      }
    }
  },
  plugins: []
};

export default config;
