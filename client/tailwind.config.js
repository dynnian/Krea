export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        barlow: ["Barlow", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        '3xl': '1.5rem', // 24px
        '4xl': '2rem',   // 32px
        "5xl": "20px",
      },
    },
  },
  plugins: [],
};
