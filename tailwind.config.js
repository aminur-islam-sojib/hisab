/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F4EF",
        surface: "#FFFFFF",
        sheet: "#FAF8F5",
        charcoal: "#18181B",
        muted: "#71717A",
        accent: "#FF5A1F",
        income: "#16A34A",
        darkAction: "#141414",
        stroke: "#E4E0D8",
        disabledBg: "#D9D6CE",
        disabledText: "#78756E",
      },
    },
  },
  plugins: [],
};
