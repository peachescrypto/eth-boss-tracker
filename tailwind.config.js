/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Boss Card Border Colors
        'boss-border': {
          light: '#fecaca',
          medium: '#6b7280', 
          dark: '#4b5563',
        },
        // Primary Brand Colors
        primary: {
          cyan: '#06b6d4',
          'cyan-hover': '#0891b2',
          purple: '#8b5cf6',
          'purple-hover': '#7c3aed',
          pink: '#ec4899',
          'pink-hover': '#db2777',
        },
        // Background Colors
        bg: {
          primary: '#0f0729',
          secondary: '#1a1a2e',
          card: 'rgba(0, 0, 0, 0.6)',
          overlay: 'rgba(0, 0, 0, 0.4)',
        },
        // Text Colors
        text: {
          primary: '#ffffff',
          secondary: '#ededed',
          muted: '#9ca3af',
          cyan: '#06b6d4',
          purple: '#a855f7',
          pink: '#fecaca',
        },
        // Status Colors
        success: {
          DEFAULT: '#10b981',
          hover: '#34d399',
        },
        warning: {
          DEFAULT: '#f97316',
          hover: '#ea580c',
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
        },
        // Border Colors
        border: {
          primary: '#06b6d4',
          secondary: '#374151',
          muted: '#6b7280',
        },
      },
      backgroundImage: {
        'gradient-boss-border': 'linear-gradient(to right, #fecaca, #6b7280, #4b5563)',
        'gradient-primary': 'linear-gradient(45deg, #06b6d4, #8b5cf6)',
        'gradient-secondary': 'linear-gradient(45deg, #8b5cf6, #ec4899)',
        'gradient-bg': 'linear-gradient(to bottom right, #581c87, #1e3a8a, #3730a3)',
        'gradient-text': 'linear-gradient(to right, #06b6d4, #8b5cf6, #ec4899)',
        'gradient-hp': 'linear-gradient(to right, #ef4444, #f97316, #eab308)',
        'gradient-progress': 'linear-gradient(to right, #06b6d4, #3b82f6)',
        'gradient-success': 'linear-gradient(to right, #10b981, #34d399)',
      },
      boxShadow: {
        'cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'pink': '0 0 20px rgba(236, 72, 153, 0.5)',
      },
    },
  },
  plugins: [],
}
