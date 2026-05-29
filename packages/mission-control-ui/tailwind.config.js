/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#ffffff',
          darker: '#fafafa',
          card: '#ffffff',
          accent: '#000000',
          neon: '#19E76E',
          alert: '#FFA9FD',
          success: '#19E76E',
          border: '#e5e5e5',
          text: '#000000',
          muted: '#666666',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
        'glow-gradient': 'radial-gradient(circle at center, rgba(14,165,233,0.05) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
