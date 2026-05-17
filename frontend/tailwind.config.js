/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ─── FoodHunt Design System v6 — Saf Monokrom (Linear/Vercel vibe) ───
        // Tüm renkler CSS variable üzerinden — light + dark mod
        // RGB ondalık format Tailwind'in `/<alpha-value>` syntax'ı için
        brand: {
          // Surfaces
          dark:     'rgb(var(--bg) / <alpha-value>)',       // page bg
          surface:  'rgb(var(--surface) / <alpha-value>)',  // cards
          card:     'rgb(var(--surface) / <alpha-value>)',
          elevated: 'rgb(var(--elevated) / <alpha-value>)', // hover, raised
          navy:     'rgb(var(--surface) / <alpha-value>)',  // legacy alias

          // Foreground (text)
          cream:    'rgb(var(--fg) / <alpha-value>)',
          muted:    'rgb(var(--muted) / <alpha-value>)',

          // Borders
          line:     'rgb(var(--border) / <alpha-value>)',

          // Accent — A varyantı: aksiyon rengi = ön plan rengi (monokrom)
          coral:        'rgb(var(--fg) / <alpha-value>)',
          'coral-light':'rgb(var(--fg) / <alpha-value>)',
          'coral-dark': 'rgb(var(--fg) / <alpha-value>)',
          amber:        'rgb(var(--fg) / <alpha-value>)',
          'amber-light':'rgb(var(--fg) / <alpha-value>)',
          gold:         'rgb(var(--fg) / <alpha-value>)',
          'gold-light': 'rgb(var(--fg) / <alpha-value>)',
          orange:       'rgb(var(--fg) / <alpha-value>)',
          light:        'rgb(var(--fg) / <alpha-value>)',

          // Semantic — sadece anlamlı yerlerde (live, success, danger)
          fresh:       'rgb(var(--success) / <alpha-value>)',
          'fresh-dark':'rgb(var(--success) / <alpha-value>)',
          trust:       'rgb(var(--success) / <alpha-value>)',
          danger:      'rgb(var(--danger) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.03em',
        tighter:  '-0.02em',
        tight:    '-0.011em',
      },
      borderRadius: {
        '4xl': '1.25rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.02)',
        'card': '0 1px 3px rgb(0 0 0 / 0.05), 0 1px 2px rgb(0 0 0 / 0.03)',
        'pop':  '0 4px 12px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.04)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        // Legacy aliases — preserved so existing JSX doesn't break
        'bounce-in':         'fadeIn 0.25s ease-out',
        'shimmer':           'shimmer 1.8s linear infinite',
        'float':             'fadeIn 0.25s ease-out',
        'glow':              'fadeIn 0.25s ease-out',
        'skeleton':          'shimmer 1.5s linear infinite',
        'pull-refresh':      'fadeIn 0.25s ease-out',
        'card-slide-left':   'slideUp 0.25s ease-out',
        'card-slide-right':  'slideUp 0.25s ease-out',
        'round-pulse':       'fadeIn 0.25s ease-out',
        'victory-glow':      'fadeIn 0.25s ease-out',
        'step-complete':     'fadeIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        // A varyantı: gradient yok, mevcut sınıfları solid renge bağla
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-food':   'none',
        'gradient-golden': 'none',
        'gradient-dark':   'none',
      }
    }
  },
  plugins: []
}
