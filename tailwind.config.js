/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#daeafe',
          200: '#bdd9fd',
          300: '#92befb',
          400: '#609af7',
          500: '#3b7df2',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172f6d'
        }
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.08)',
        glass: '0 20px 80px rgba(37, 99, 235, 0.18)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top right, rgba(96,165,250,.24), transparent 28%), radial-gradient(circle at bottom left, rgba(59,130,246,.18), transparent 24%), linear-gradient(135deg, #06122c 0%, #0a1d48 55%, #0e2f72 100%)'
      }
    },
  },
  plugins: [],
};
