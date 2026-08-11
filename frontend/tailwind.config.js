/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        chestnut: '#55443A',
        almond: '#CFD0CD',
        morning: '#8A9992',
        darkBrown: '#4D2308',
        surface: '#F8F7F4',
        textMain: '#241A15',
        textMuted: '#675E58',
        success: '#557A60',
        warning: '#B58445',
        danger: '#A4463E',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 25px -5px rgba(77, 35, 8, 0.05), 0 8px 10px -6px rgba(77, 35, 8, 0.03)',
        card: '0 4px 6px -1px rgba(85, 68, 58, 0.05), 0 2px 4px -2px rgba(85, 68, 58, 0.05)',
      },
    },
  },
  plugins: [],
};
