import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        command: {
          950: "#05070a",
          900: "#080b10",
          850: "#0c1118",
          800: "#111821"
        }
      },
      boxShadow: {
        "emerald-glow": "0 0 32px rgba(16, 185, 129, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
