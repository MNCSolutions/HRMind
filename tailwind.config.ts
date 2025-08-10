import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: "#0a2540", light: "#163e69", accent: "#4cc9f0" } }
    }
  },
  plugins: [],
};
export default config;
