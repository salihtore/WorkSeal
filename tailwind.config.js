/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050810",
        foreground: "#F0F6FF",
        card: "#0d1117",
        primary: "#4FC3F7",
        secondary: "#111827",
        muted: "#111827",
        border: "rgba(255, 255, 255, 0.07)",
        destructive: "#F87171",
      },
    },
  },
  plugins: [require("nativewind/tailwind/css")],
};