/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Primary Piggy Bank palette
         */
        piggy: {
          brand: '#E8959A',         // soft piggy-pink
          'brand-dark': '#D17F84'   // deeper accent
        },

        /**
         * UI surfaces & text
         */
        background: '#18181b',      // base app background (dark charcoal)
        surface: '#2A2A2A',         // cards and panels
        'text-primary': '#F5F5F5',  // main text
        'text-secondary': '#CCCCCC',// secondary text

        /**
         * Legacy shadcn/ui tokens (if needed)
         */
        foreground: '#f4f4f5',      // alias for text-primary
        border: '#3f3f46'           // UI borders
      },
      borderRadius: {
        /** Rounded radius inspired by a pig’s snout */
        snout: '1.5rem',
        '2xl': '1.25rem'           // keep existing 2xl
      },
      boxShadow: {
        /** Soft pink glow for highlight */
        snout: '0 4px 12px rgba(232,149,154,0.3)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
