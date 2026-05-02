/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        academy: {
          ink: '#09090b',
          panel: '#121216',
          line: '#27272f',
          muted: '#a1a1aa',
          neon: '#b6ff3b',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
          danger: '#fb7185'
        }
      },
      boxShadow: {
        glow: '0 0 32px rgba(182, 255, 59, 0.18)',
        violet: '0 0 32px rgba(139, 92, 246, 0.2)'
      },
      backgroundImage: {
        'radial-energy': 'radial-gradient(circle at top left, rgba(182, 255, 59, 0.16), transparent 28%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.18), transparent 30%)'
      }
    }
  },
  plugins: []
};
