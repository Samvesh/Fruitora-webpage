/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "sans-serif"],
        display: ["Inter", "sans-serif"]
      },
      colors: {
        cream: "#F7F6F1",
        "fruitora-bg": "#F7F6F1",
        "fruitora-dark": "#141814",
        "fruitora-forest": "#1F3D1F",
        "fruitora-forest-hover": "#162E16",
        "fruitora-sage": "#E2ECDC",
        "fruitora-sage-card": "#E1EAD9",
        "fruitora-muted": "#687066",
        "fruitora-subtle": "#8C9388",
        night: "#05060f",
        ink: "#11131f",
        mist: "rgba(255,255,255,0.72)"
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      },
      boxShadow: {
        glow: "0 0 70px rgba(31, 61, 31, 0.12)",
        aura: "0 20px 60px rgba(0,0,0,0.06)",
        card: "0 10px 30px rgba(0,0,0,0.04)"
      }
    }
  },
  plugins: []
};
