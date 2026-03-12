/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#e6f4ea',
          DEFAULT: '#10b981', // Verde estilo FundControl
          dark: '#059669',
        },
        sidebar: {
          bg: '#ffffff',
          icon: '#9ca3af',
          textHover: '#111827',
          activeBg: '#e6f4ea', // Fondo verde claro
          activeText: '#059669', // Verde oscuro
        },
        surface: '#f3f4f6', // Fondo gris claro de la pag
      }
    },
  },
  plugins: [],
}
