/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./astro.config.mjs",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#EA2027",
      },
      fontFamily: { sans: "'Poppins', sans-serif" },
      animation: {
        "bounce-slow": "bounce-slow 2.5s infinite",
        scroll: "scroll 10s linear infinite",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(5%)" },
          "50%": { transform: "translateY(0)" },
        },
        scroll: {
          "0%": { left: 0 },
          "100%": {
            left: "-100%",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
};
