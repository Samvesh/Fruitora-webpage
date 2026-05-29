/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"]
      },
      colors: {
        night: "#05060f",
        ink: "#11131f",
        mist: "rgba(255,255,255,0.72)"
      },
      boxShadow: {
        glow: "0 0 70px rgba(255, 88, 171, 0.22)",
        aura: "0 30px 100px rgba(0,0,0,0.45)"
      },
      backgroundImage: {
        "radial-stage": "radial-gradient(circle at top left, rgba(255, 184, 3, .24), transparent 28%), radial-gradient(circle at 70% 10%, rgba(91, 124, 250, .24), transparent 32%), radial-gradient(circle at 50% 85%, rgba(255, 79, 216, .18), transparent 35%)"
      }
    }
  },
  plugins: []
};
