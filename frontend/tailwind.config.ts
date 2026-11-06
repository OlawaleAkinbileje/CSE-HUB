import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2446F5", // Main buttons & links
        secondary: "#7853ED", // Highlights and accents
        accent: "#06B6D4", // Informational elements
        success: "#16A36A", // Approved / success states
        warning: "#F59E0B", // Pending / caution states
        background: "#F8FAFF", // Main background
        card: "#FFFFFF", // Card background
        primaryText: "#172554", // Headings & primary body
        secondaryText: "#64748B", // Subtitles & metadata
        borderLine: "#E5EAF4", // Card and input borders
      },
    },
  },
  plugins: [],
};
export default config;
