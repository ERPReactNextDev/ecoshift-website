import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    // Sharp corners everywhere — no rounded by default
    borderRadius: {
      none:    '0px',
      sm:      '2px',
      DEFAULT: '2px',
      md:      '2px',
      lg:      '4px',
      xl:      '4px',
      '2xl':   '4px',
      '3xl':   '4px',
      full:    '9999px'  // pill — use deliberately
    },

    // Override ALL built-in max-width caps so max-w-* = full width
    maxWidth: {
      none:        'none',
      xs:          '100%',
      sm:          '100%',
      md:          '100%',
      lg:          '100%',
      xl:          '100%',
      '2xl':       '100%',
      '3xl':       '100%',
      '4xl':       '100%',
      '5xl':       '100%',
      '6xl':       '100%',
      '7xl':       '100%',
      full:        '100%',
      min:         'min-content',
      max:         'max-content',
      fit:         'fit-content',
      prose:       '65ch',           // keep prose readable
      'screen-sm': '100%',
      'screen-md': '100%',
      'screen-lg': '100%',
      'screen-xl': '100%',
      'screen-2xl':'100%',
    },

    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16'
        },
        ink:   '#0e1a14',
        paper: '#f5f4f0',
        rule:  '#d4d0c8',
      },
      fontFamily: {
        mono: ['ui-monospace', 'Cascadia Code', 'Fira Code', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      }
    }
  },

  // Disable Tailwind's built-in container plugin; we use our own in globals.css
  corePlugins: {
    container: false,
  },

  plugins: []
}

export default config
