/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          dark: 'hsl(222, 47%, 11%)',
        },
        foreground: {
          DEFAULT: 'hsl(222, 47%, 11%)',
          dark: 'hsl(210, 40%, 98%)',
        },
        card: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          dark: 'hsl(222, 47%, 11%)',
        },
        border: {
          DEFAULT: 'hsl(214, 32%, 91%)',
          dark: 'hsl(217, 33%, 17%)',
        },
        primary: {
          DEFAULT: 'hsl(221, 83%, 53%)',
          dark: 'hsl(217, 91%, 60%)',
        },
        muted: {
          DEFAULT: 'hsl(210, 40%, 96%)',
          dark: 'hsl(217, 33%, 17%)',
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'soft-dark': '0 2px 8px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}
