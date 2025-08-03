/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,ts}", "./index.html"],
  theme: {
    extend: {
      colors: {
        // Couleurs principales DBZ
        dbz: {
          orange: "#FF5000", // Couleur de la tenue de Goku
          blue: "#1E88E5", // Super Saiyan Blue
          yellow: "#FFD700", // Super Saiyan
          red: "#FF0000", // Kaio-ken
          purple: "#9C27B0", // Couleur de Piccolo
          green: "#4CAF50", // Namek
        },
        // Dégradés de background
        background: {
          dark: "#1A1A1A",
          light: "#2D2D2D",
        },
      },
      fontFamily: {
        dbz: ["Mighty Souly", "sans-serif"], // Pour les titres style DBZ
        power: ["gg-sans-2", "sans-serif"], // Pour le power level
        body: ["Poppins", "sans-serif"], // Pour le texte normal
      },
      animation: {
        "ki-pulse": "ki-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "power-up": "power-up 0.5s ease-in-out",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "ki-pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        "power-up": {
          "0%": { transform: "scale(0.95)", opacity: 0.5 },
          "50%": { transform: "scale(1.05)", opacity: 0.8 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      boxShadow: {
        ki: "0 0 15px rgba(255, 80, 0, 0.5)",
        ssj: "0 0 20px rgba(255, 215, 0, 0.6)",
        ssjb: "0 0 20px rgba(30, 136, 229, 0.6)",
      },
    },
  },
  plugins: [],
};
