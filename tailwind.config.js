/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
   screens: {
      // ✅ Standard mobile-first breakpoints
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xl1: "1380px",
      xxl: "1579px",
      xxl1: "2000px",

      // // ✅ Your shrinking (max-width) breakpoints
      // "max-xxl1": { max: "2070px"},
      // "max-xxl": { max: "1770px"},
      // "max-xl": { max: "1579px" },
      // "max-lg": { max: "1123px" },
      // "max-md": { max: "967px" },
      // "max-sm": { max: "639px" },
    },
    extend: {
       fontFamily: {
        // Add a new utility name (e.g., 'kollektif') and specify the font name(s)
        kollektif: ['Kollektif', 'sans-serif'],
         manrope: ["Manrope", "sans-serif"],
    
      },
      colors: {
        'border': 'linear-gradient(90deg, rgba(255, 255, 255) 100%, rgba(106, 106, 106) 0)',
         primary: "#F5C243",
        lightBg: "#F5F7FA",
       
      },
      
    },
  },
  plugins: [],
}