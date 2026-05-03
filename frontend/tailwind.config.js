/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Times New Roman', 'Georgia', 'serif'],
        mono: ['Courier New', 'IBM Plex Mono', 'monospace']
      },
      boxShadow: {
        brutal: '6px 6px 0 #0a0a0a',
        'brutal-blue': '4px 4px 0 #1e40af',
        'brutal-green': '4px 4px 0 #059669',
        'brutal-purple': '4px 4px 0 #7c3aed'
      },
      colors: {
        paper: '#f5f1e8',
        ink: '#0a0a0a',
        accent: '#c41e3a',
        // Palette moderne étendue
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d'
        },
        tertiary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c2d92',
          900: '#581c87'
        },
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#10b981'
      }
    }
  },
  plugins: []
};

