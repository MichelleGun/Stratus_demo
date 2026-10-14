/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#070B17', 900: '#0B1020', 850: '#0F1529', 800: '#141B33', 700: '#1C2544', 600: '#2A3560', 500: '#4A5682', 400: '#7480AA', 300: '#A3ADCF', 200: '#CDD3EA', 100: '#E9ECF7' },
        sky: { 400: '#4CC3FF', 500: '#29A8F5' },
        violet: { 400: '#9B8CFF', 500: '#7C6BF5' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
