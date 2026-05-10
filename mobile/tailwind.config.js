module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f0f13",
        card: "#1a1a24",
        primary: "#6c63ff",
        secondary: "#2a2a38",
        accent: "#1e1b4b",
        destructive: "#ff4d6d",
        foreground: "#e8e8f0",
        muted: "#6b6b85",
        border: "#2a2a38",
      },
    },
  },
  plugins: [require("nativewind/tailwind/css")],
};
