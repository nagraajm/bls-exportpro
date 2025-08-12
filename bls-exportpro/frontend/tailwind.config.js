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
        // BLS Brand Colors from Logo
        bls: {
          blue: {
            primary: '#2563eb',
            secondary: '#1e40af',
            light: '#60a5fa',
          },
          orange: '#f97316',
          purple: '#7c3aed',
          teal: '#06b6d4',
        },
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F59E0B',
        glass: {
          light: 'rgba(255, 255, 255, 0.08)',
          DEFAULT: 'rgba(255, 255, 255, 0.12)',
          medium: 'rgba(255, 255, 255, 0.16)',
          heavy: 'rgba(255, 255, 255, 0.20)',
        }
      },
      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px rgba(31, 38, 135, 0.25)',
        'glass-lg': '0 16px 48px rgba(31, 38, 135, 0.4)',
        'glass-inset': 'inset 0 2px 4px rgba(255, 255, 255, 0.1)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        glow: {
          '0%, 100%': {
            opacity: 1,
            'box-shadow': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
          },
          '50%': {
            opacity: 0.8,
            'box-shadow': '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)',
          },
        },
        shimmer: {
          '0%': {
            'background-position': '-200% 0',
          },
          '100%': {
            'background-position': '200% 0',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // BLS Brand Gradients
        'bls-primary': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'bls-secondary': 'linear-gradient(135deg, #06b6d4 0%, #60a5fa 100%)',
        'bls-accent': 'linear-gradient(135deg, #f97316 0%, #2563eb 100%)',
        'bls-mesh': 'radial-gradient(at 40% 20%, rgba(37, 99, 235, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124, 58, 237, 0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(6, 182, 212, 0.3) 0px, transparent 50%), radial-gradient(at 80% 50%, rgba(249, 115, 22, 0.3) 0px, transparent 50%)',
        // Legacy gradients
        'gradient-purple-blue': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-teal-green': 'linear-gradient(135deg, #0BA360 0%, #3CBA92 100%)',
        'gradient-orange-pink': 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
        'gradient-indigo-violet': 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.3) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.3) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,0.3) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,0.3) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,0.3) 0px, transparent 50%)',
        'shimmer': 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}