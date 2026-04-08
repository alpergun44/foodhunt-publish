/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── FoodHunt Design System v3 ─────────────────────────────
        // Color psychology: warm tones stimulate appetite (red, orange, amber)
        // Dark base = Gen Z preference + food photography contrast
        // Coral accent = appetite trigger + modern trend color
        brand: {
          // Primary CTA — Coral/Tomato Red (appetite stimulation)
          coral:    '#FF6B35',
          'coral-light': '#FF8A5C',
          'coral-dark':  '#E55A2B',

          // Secondary — Golden Amber/Honey (warmth, comfort food)
          amber:    '#FFB627',
          'amber-light': '#FFCF5C',

          // Background — Rich dark tones (premium, modern, Gen Z dark mode)
          dark:     '#0D0D0D',
          surface:  '#1A1A1A',
          card:     '#242424',
          elevated: '#2E2E2E',

          // Text — Warm whites (not clinical blue-white)
          cream:    '#FFF8F0',
          muted:    '#A8A29E',

          // Accent — Fresh green (healthy options, success states)
          fresh:    '#4ADE80',
          'fresh-dark': '#22C55E',

          // Legacy aliases (so old classes still work)
          orange:   '#FF6B35',
          light:    '#FF8A5C',
          navy:     '#1A1A1A',

          // New theme colors
          trust:    '#06C167',       // Trust green (Uber Eats-inspired)
          gold:     '#FFD700',       // Winner celebration gold
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'bounce-in':  'bounceIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'card-slide-left': 'cardSlideLeft 0.4s ease-out',
        'card-slide-right': 'cardSlideRight 0.4s ease-out',
        'round-pulse': 'roundPulse 0.6s ease-out',
        'victory-glow': 'victoryGlow 2s ease-in-out infinite',
        'step-complete': 'stepComplete 0.4s ease-out',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceIn: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '60%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glow:     { '0%': { boxShadow: '0 0 20px rgba(255,107,53,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(255,107,53,0.6)' } },
        cardSlideLeft: { from: { transform: 'translateX(-30px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        cardSlideRight: { from: { transform: 'translateX(30px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        roundPulse: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '50%': { transform: 'scale(1.1)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        victoryGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }, '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 107, 53, 0.3)' } },
        stepComplete: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(0.9)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-food': 'linear-gradient(135deg, #FF6B35, #FFB627)',
        'gradient-dark': 'linear-gradient(180deg, #0D0D0D 0%, #1A1A1A 100%)',
      }
    }
  },
  plugins: []
}
