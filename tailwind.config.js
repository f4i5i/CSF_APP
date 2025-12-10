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

      // ✅ Your shrinking (max-width) breakpoints
      "max-xxl1": { max: "2070px"},
      "max-xxl": { max: "1770px"},
      "max-xl": { max: "1579px" },
      "max-lg": { max: "1123px" },
      "max-md": { max: "967px" },
      "max-sm": { max: "639px" },
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
      // Fluid responsive utilities using clamp()
      fontSize: {
        'fluid-xs': 'clamp(0.625rem, 0.5rem + 0.52vw, 0.75rem)',      // 10px → 12px
        'fluid-sm': 'clamp(0.75rem, 0.625rem + 0.52vw, 0.875rem)',    // 12px → 14px
        'fluid-base': 'clamp(0.875rem, 0.75rem + 0.52vw, 1rem)',      // 14px → 16px
        'fluid-md': 'clamp(1rem, 0.875rem + 0.52vw, 1.125rem)',       // 16px → 18px
        'fluid-lg': 'clamp(1.25rem, 1rem + 1.04vw, 1.5rem)',          // 20px → 24px
        'fluid-xl': 'clamp(1.5rem, 1.125rem + 1.56vw, 2rem)',         // 24px → 32px
        'fluid-2xl': 'clamp(1.5rem, 0.875rem + 2.6vw, 2.875rem)',     // 24px → 46px
        'fluid-3xl': 'clamp(2rem, 1rem + 4.17vw, 3.75rem)',           // 32px → 60px
      },
      spacing: {
        'fluid-2': 'clamp(0.5rem, 0.375rem + 0.52vw, 0.75rem)',       // 8px → 12px
        'fluid-3': 'clamp(0.625rem, 0.5rem + 0.52vw, 0.875rem)',      // 10px → 14px
        'fluid-4': 'clamp(0.75rem, 0.625rem + 0.52vw, 1rem)',         // 12px → 16px
        'fluid-5': 'clamp(0.9375rem, 0.75rem + 0.78vw, 1.25rem)',     // 15px → 20px
        'fluid-6': 'clamp(1rem, 0.75rem + 1.04vw, 1.5rem)',           // 16px → 24px
        'fluid-10': 'clamp(1.5rem, 1rem + 2.08vw, 2.5rem)',           // 24px → 40px
      },
      width: {
        'fluid-avatar-sm': 'clamp(2.5rem, 2rem + 2.08vw, 3rem)',      // 40px → 48px
        'fluid-avatar-md': 'clamp(3rem, 2.5rem + 2.08vw, 3.375rem)',  // 48px → 54px
        'fluid-avatar-lg': 'clamp(3.5rem, 3rem + 2.08vw, 4rem)',      // 56px → 64px
        'fluid-icon-sm': 'clamp(1.5rem, 1.25rem + 1.04vw, 2rem)',     // 24px → 32px
        'fluid-icon-md': 'clamp(2rem, 1.5rem + 2.08vw, 2.375rem)',    // 32px → 38px
        'fluid-divider': 'clamp(0.125rem, 0.1rem + 0.1vw, 0.1875rem)', // 2px → 3px
      },
      height: {
        'fluid-avatar-sm': 'clamp(2.5rem, 2rem + 2.08vw, 3rem)',
        'fluid-avatar-md': 'clamp(3rem, 2.5rem + 2.08vw, 3.375rem)',
        'fluid-avatar-lg': 'clamp(3.5rem, 3rem + 2.08vw, 4rem)',
        'fluid-icon-sm': 'clamp(1.5rem, 1.25rem + 1.04vw, 2rem)',
        'fluid-icon-md': 'clamp(2rem, 1.5rem + 2.08vw, 2.375rem)',
        'fluid-cell': 'clamp(1.25rem, 1rem + 1.04vw, 1.5rem)',        // 20px → 24px
        'fluid-event-card': 'clamp(12rem, 10rem + 8.33vw, 15rem)',    // 192px → 240px
      },
      borderRadius: {
        'fluid-sm': 'clamp(0.5rem, 0.375rem + 0.52vw, 0.75rem)',      // 8px → 12px
        'fluid-md': 'clamp(0.75rem, 0.625rem + 0.52vw, 0.875rem)',    // 12px → 14px
        'fluid-lg': 'clamp(1rem, 0.75rem + 1.04vw, 1.25rem)',         // 16px → 20px
        'fluid-xl': 'clamp(1.25rem, 0.875rem + 1.56vw, 1.875rem)',    // 20px → 30px
        'fluid-2xl': 'clamp(2rem, 1.5rem + 2.08vw, 2.625rem)',        // 32px → 42px
        'fluid-3xl': 'clamp(2.5rem, 2rem + 2.08vw, 3.125rem)',        // 40px → 50px
      },

    },
  },
  plugins: [],
}