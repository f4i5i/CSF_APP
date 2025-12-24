/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
      "max-xxl1": { max: "2070px" },
      "max-xxl": { max: "1770px" },
      "max-xl": { max: "1579px" },
      "max-lg": { max: "1123px" },
      "max-md": { max: "967px" },
      "max-sm": { max: "639px" },
    },
    extend: {
      fontFamily: {
        // Add a new utility name (e.g., 'kollektif') and specify the font name(s)
        kollektif: ["Kollektif", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
      colors: {
        border:
          "linear-gradient(90deg, rgba(255, 255, 255) 100%, rgba(106, 106, 106) 0)",
        primary: "#F5C243",
        lightBg: "#F5F7FA",

        // new provided figme  colors starting here
        // <------------------------------------------------>
        "btn-gold": "#F3BC48", // Main buttons, highlights, icons (the gold one)
        "text-primary": "#173151", // Main text color (brand navy used for most text)
        "btn-secondary": "#7E97B5", // Secondary buttons (soft blue)
        "status-success": "#32AE60", // Success / active / positive status (green)
        // Text Colors
        "heading-dark": "#0F1D2E", // Headings, titles, big numbers (very dark navy)
        "text-body": "#1B1B1B", // Normal paragraph text (almost black)
        "text-muted": "#666D80", // Smaller text, descriptions, labels (gray)

        // Borders & Lines
        "border-light": "#DFE1E7", // Card borders, dividers, input borders (light gray)
        // Success Colors (green shades – darker number = darker shade)
        "success-darkest": "#272186", // Success/900 – very dark green
        "success-darker": "#34207D", // Success/800
        "success-dark": "#4329A2", // Success/700
        "success-main": "#5B3CCF", // Success/600 – main success color (good for buttons)
        "success-light": "#5E3AE4", // Success/500 – brighter green (badges, alerts)

        // Neutral Colors (grays from black to white)
        'neutral-black': '#111111',     // Neutral/900 – almost pure black
        'neutral-darkest': '#424242',   // Neutral/800 – very dark gray
        'neutral-darker': '#555555',    // Neutral/700 – dark gray
        'neutral-dark': '#6D6D6D',      // Neutral/600 – medium-dark gray
        'neutral-main': '#787878',      // Neutral/500 – standard medium gray
        'neutral-medium': '#939393',    // Neutral/400 – light-medium gray
        'neutral-light': '#A5A5A5',     // Neutral/300 – light gray
        'neutral-lighter': '#DEDEDE',   // Neutral/200 – very light gray
        'neutral-lightest': '#F5F5F5',  // Neutral/20 – almost white
        'neutral-white': '#FFFFFF',     // Neutral/10 – pure white

        
        // Error Colors (red shades – darker number = darker shade)
        "error-darkest": "#601616", // Error/100 – very dark red
        "error-darker": "#7E1D10", // Error/90
        "error-dark": "#A32525", // Error/80
        "error-main": "#D02F2F", // Error/70 – main error color (error buttons)
        "error-light": "#E53434", // Error/60 – brighter red (alerts, borders)

        // Warning Colors (yellow/orange shades – darker number = darker shade)
        "warning-darkest": "#6B611D", // Warning/100 – very dark olive (strong warning background)
        "warning-darker": "#8C7F25", // Warning/90
        "warning-dark": "#B5A330", // Warning/80
        "warning-main": "#EBD13E", // Warning/70 – main warning color (perfect for warning buttons)
        "warning-light": "#FFE644", // Warning/60 – bright yellow (good for badges, alerts)
         // new provided figme  colors ending here
        // <------------------------------------------------>
        "badge-bg":"#eeeff0",
        "placeholder-color":"#3B3B3B",
        "nuetral-100":"#0A0A0A",
        "nuetral-200":"#0D0D12",
        "gray":'#EAEAEA',
        "dark_gray":"#4c5055",
        "card_bg":"#f1f2f2",
        "text_gray":"#464647",
      },
      // Fluid responsive utilities using clamp()
      fontSize: {
        "fluid-xs": "clamp(0.625rem, 0.5rem + 0.52vw, 0.75rem)", // 10px → 12px
        "fluid-sm": "clamp(0.75rem, 0.625rem + 0.52vw, 0.875rem)", // 12px → 14px
        "fluid-base": "clamp(0.875rem, 0.75rem + 0.52vw, 1rem)", // 14px → 16px
        "fluid-md": "clamp(1rem, 0.875rem + 0.52vw, 1.125rem)", // 16px → 18px
        "fluid-lg": "clamp(1.25rem, 1rem + 1.04vw, 1.5rem)", // 20px → 24px
        "fluid-xl": "clamp(1.5rem, 1.125rem + 1.56vw, 2rem)", // 24px → 32px
        "fluid-2xl": "clamp(1.5rem, 0.875rem + 2.6vw, 2.875rem)", // 24px → 46px
        "fluid-3xl": "clamp(2rem, 1rem + 4.17vw, 3.75rem)", // 32px → 60px
      },
      spacing: {
        "fluid-2": "clamp(0.5rem, 0.375rem + 0.52vw, 0.75rem)", // 8px → 12px
        "fluid-3": "clamp(0.625rem, 0.5rem + 0.52vw, 0.875rem)", // 10px → 14px
        "fluid-4": "clamp(0.75rem, 0.625rem + 0.52vw, 1rem)", // 12px → 16px
        "fluid-5": "clamp(0.9375rem, 0.75rem + 0.78vw, 1.25rem)", // 15px → 20px
        "fluid-6": "clamp(1rem, 0.75rem + 1.04vw, 1.5rem)", // 16px → 24px
        "fluid-10": "clamp(1.5rem, 1rem + 2.08vw, 2.5rem)", // 24px → 40px
      },
      width: {
        "fluid-avatar-sm": "clamp(2.5rem, 2rem + 2.08vw, 3rem)", // 40px → 48px
        "fluid-avatar-md": "clamp(3rem, 2.5rem + 2.08vw, 3.375rem)", // 48px → 54px
        "fluid-avatar-lg": "clamp(3.5rem, 3rem + 2.08vw, 4rem)", // 56px → 64px
        "fluid-icon-sm": "clamp(1.5rem, 1.25rem + 1.04vw, 2rem)", // 24px → 32px
        "fluid-icon-md": "clamp(2rem, 1.5rem + 2.08vw, 2.375rem)", // 32px → 38px
        "fluid-divider": "clamp(0.125rem, 0.1rem + 0.1vw, 0.1875rem)", // 2px → 3px
      },
      height: {
        "fluid-avatar-sm": "clamp(2.5rem, 2rem + 2.08vw, 3rem)",
        "fluid-avatar-md": "clamp(3rem, 2.5rem + 2.08vw, 3.375rem)",
        "fluid-avatar-lg": "clamp(3.5rem, 3rem + 2.08vw, 4rem)",
        "fluid-icon-sm": "clamp(1.5rem, 1.25rem + 1.04vw, 2rem)",
        "fluid-icon-md": "clamp(2rem, 1.5rem + 2.08vw, 2.375rem)",
        "fluid-cell": "clamp(1.25rem, 1rem + 1.04vw, 1.5rem)", // 20px → 24px
        "fluid-event-card": "clamp(12rem, 10rem + 8.33vw, 15rem)", // 192px → 240px
      },
      borderRadius: {
        "fluid-sm": "clamp(0.5rem, 0.375rem + 0.52vw, 0.75rem)", // 8px → 12px
        "fluid-md": "clamp(0.75rem, 0.625rem + 0.52vw, 0.875rem)", // 12px → 14px
        "fluid-lg": "clamp(1rem, 0.75rem + 1.04vw, 1.25rem)", // 16px → 20px
        "fluid-xl": "clamp(1.25rem, 0.875rem + 1.56vw, 1.875rem)", // 20px → 30px
        "fluid-2xl": "clamp(2rem, 1.5rem + 2.08vw, 2.625rem)", // 32px → 42px
        "fluid-3xl": "clamp(2.5rem, 2rem + 2.08vw, 3.125rem)", // 40px → 50px
      },
      backgroundImage: {
        "page-gradient":
          "radial-gradient(circle at top center, #F4F5F7 0%, #E3E5E6 35%, #CFD6DE 60%, #B7C3D1 100%)",
      },
    },
  },
  plugins: [    function({ addUtilities }) {
      addUtilities({
        '.no-scrollbar::-webkit-scrollbar': {
          'display': 'none',
        },
        '.no-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.border': {
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '#DFE1E7',
      },
      },
    )
    }],
};
