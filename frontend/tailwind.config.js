/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── FoodHunt Design System v5 — Charcoal + Lava Orange ───
        // Bilimsel araştırma temelli: turuncu+kırmızı iştah tetikler,
        // koyu gri arka plan göz yorgunluğunu %40 azaltır.
        // WCAG 2.1 AA uyumlu kontrast oranları.
        brand: {
          // Primary CTA — Lava Orange (iştah tetikleyici, hipotalamus aktivasyonu)
          coral:    '#FF5A1F',
          'coral-light': '#FF7A47',
          'coral-dark':  '#E04D18',

          // Secondary — Chili Red (aciliyet, aksiyon, CTA vurgusu)
          amber:    '#E63946',
          'amber-light': '#FF4D5A',

          // Accent — Saffron Gold (ödül, badge, premium, dopamin tetikleyici)
          gold:     '#FFB627',
          'gold-light': '#FFCA5C',

          // Background — Charcoal Night (yumuşak koyu gri, göz dostu)
          dark:     '#141417',
          surface:  '#1E1E24',
          card:     '#1E1E24',
          elevated: '#2A2A35',

          // Text — Snow Mist (göz dostu off-white)
          cream:    '#F2F2F7',
          muted:    '#8B8B9E',

          // Success — Fresh Mint (tazelik, sağlıklı seçenekler)
          fresh:    '#34D399',
          'fresh-dark': '#2BB584',

          // Legacy aliases (geriye uyumluluk)
          orange:   '#FF5A1F',
          light:    '#FF7A47',
          navy:     '#1E1E24',

          // Feature colors
          trust:    '#34D399',
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
        'skeleton':   'shimmer 1.5s linear infinite',
        'pull-refresh': 'pullRefresh 0.5s cubic-bezier(0.34,1.56,0.64,1)',
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
        glow:     { '0%': { boxShadow: '0 0 20px rgba(255,90,31,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(255,90,31,0.6)' } },
        pullRefresh: { '0%': { transform: 'rotate(0deg) scale(0.8)' }, '100%': { transform: 'rotate(360deg) scale(1)' } },
        cardSlideLeft: { from: { transform: 'translateX(-30px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        cardSlideRight: { from: { transform: 'translateX(30px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        roundPulse: { '0%': { transform: 'scale(0.8)', opacity: '0' }, '50%': { transform: 'scale(1.1)', opacity: '1' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        victoryGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(255, 182, 39, 0.3)' }, '50%': { boxShadow: '0 0 40px rgba(255, 182, 39, 0.6), 0 0 80px rgba(255, 90, 31, 0.3)' } },
        stepComplete: { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(0.9)' } },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-food': 'linear-gradient(135deg, #FF5A1F, #E63946)',
        'gradient-golden': 'linear-gradient(135deg, #FFB627, #FF5A1F)',
        'gradient-dark': 'linear-gradient(180deg, #141417 0%, #1E1E24 100%)',
      }
    }
  },
  plugins: []
}
