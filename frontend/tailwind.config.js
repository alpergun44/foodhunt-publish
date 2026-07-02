/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ─── FoodHunt Design System v7 — Native iOS ───
        // Tüm renkler CSS variable üzerinden — light + dark mod
        // RGB ondalık format Tailwind'in `/<alpha-value>` syntax'ı için
        brand: {
          // Surfaces
          dark:     'rgb(var(--bg) / <alpha-value>)',       // page bg (grouped)
          surface:  'rgb(var(--surface) / <alpha-value>)',  // cards
          card:     'rgb(var(--surface) / <alpha-value>)',
          elevated: 'rgb(var(--elevated) / <alpha-value>)', // fill, hover
          navy:     'rgb(var(--surface) / <alpha-value>)',  // legacy alias

          // Foreground (text)
          cream:        'rgb(var(--fg) / <alpha-value>)',
          'cream-light':'rgb(var(--fg) / <alpha-value>)',
          muted:        'rgb(var(--muted) / <alpha-value>)',

          // Borders / separators
          line:     'rgb(var(--border) / <alpha-value>)',

          // Accent — iOS tint (FoodHunt turuncu)
          coral:        'rgb(var(--tint) / <alpha-value>)',
          'coral-light':'rgb(var(--tint) / <alpha-value>)',
          'coral-dark': 'rgb(var(--tint) / <alpha-value>)',
          amber:        'rgb(var(--tint) / <alpha-value>)',
          'amber-light':'rgb(var(--tint) / <alpha-value>)',
          gold:         'rgb(var(--tint) / <alpha-value>)',
          'gold-light': 'rgb(var(--tint) / <alpha-value>)',
          orange:       'rgb(var(--tint) / <alpha-value>)',
          light:        'rgb(var(--fg) / <alpha-value>)',

          // Semantic — iOS system colors
          fresh:       'rgb(var(--success) / <alpha-value>)',
          'fresh-dark':'rgb(var(--success) / <alpha-value>)',
          trust:       'rgb(var(--success) / <alpha-value>)',
          danger:      'rgb(var(--danger) / <alpha-value>)',
        }
      },
      fontFamily: {
        // SF sistem fontu — iOS'ta SF Pro, macOS'ta SF, diğerlerinde sistem
        sans:    ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono:    ['ui-monospace', 'SF Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        // SF kendi optik tracking'ini yönetir — legacy sınıflar nötrlendi
        tightest: '0',
        tighter:  '0',
        tight:    '0',
      },
      borderRadius: {
        '4xl': '1.25rem',
      },
      boxShadow: {
        // iOS: gölge neredeyse yok — ayrışma yüzey rengiyle
        'soft': '0 1px 2px rgb(0 0 0 / 0.04)',
        'card': '0 1px 2px rgb(0 0 0 / 0.04)',
        'pop':  '0 4px 16px rgb(0 0 0 / 0.08)',
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
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-food':   'none',
        'gradient-golden': 'none',
        'gradient-dark':   'none',
      }
    }
  },
  plugins: []
}
