/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── FoodHunt Design System v4 — Navy + Cherry Red ────────
        // MAJOR VISUAL SHIFT: Dark navy base instead of gray-black
        // Cherry red primary (proven food industry color — Zomato, DoorDash)
        // Warm gold secondary for celebration/highlights
        brand: {
          // Primary CTA — Cherry Red (appetite stimulation, food industry standard)
          coral:    '#E23744',
          'coral-light': '#FF4D5A',
          'coral-dark':  '#C62D39',

          // Secondary — Warm Gold (celebration, highlights, premium feel)
          amber:    '#F5A623',
          'amber-light': '#FFB94D',

          // Background — Deep navy (premium, modern, not generic dark)
          dark:     '#0A1628',
          surface:  '#121F33',
          card:     '#1A2D47',
          elevated: '#243B5C',

          // Text — Warm ivory tones
          cream:    '#FFF5EB',
          muted:    '#8899AA',

          // Accent — Emerald green (healthy, success, trust)
          fresh:    '#00C853',
          'fresh-dark': '#00A844',

          // Legacy aliases
          orange:   '#E23744',
          light:    '#FF4D5A',
          navy:     '#121F33',

          // Feature colors
          trust:    '#00C853',
          gold:     '#FFD700',
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
        glow:     { '0%': { boxShadow: '0 0 20px rgba(226,55,68,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(226,55,68,0.6)' } },
        cardSlideLeft: { from: { transform: 'translateX(-30px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        cardSlideRight: { from: { transform: 'translateX(30px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        roundPulse: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '50%': { transform: 'scale(1.1)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        victoryGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }, '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(226, 55, 68, 0.3)' } },
        stepComplete: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(0.9)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-food': 'linear-gradient(135deg, #E23744, #F5A623)',
        'gradient-dark': 'linear-gradient(180deg, #0A1628 0%, #121F33 100%)',
      }
    }
  },
  plugins: []
}
