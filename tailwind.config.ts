import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./config/**/*.{js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#0d2f22",
        leaf: "#214f36",
        cream: "#f7efd9",
        linen: "#fbf7ed",
        coffee: "#8a4d25",
        toast: "#c88b4d",
        brass: "#b88a3d",
        ink: "#17251f",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(13, 47, 34, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
