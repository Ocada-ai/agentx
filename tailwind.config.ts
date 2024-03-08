import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './ai_user_components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './ai_hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
        gabarito: ['var(--font-gabarito)', ...fontFamily.sans],
        rethink_sans: ['var(--font-rethink_sans)', ...fontFamily.sans],
        display: ['var(--font-gabarito)', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        green: {
          '50': '#f0fdf6',
          '100': '#dbfdec',
          '200': '#baf8d9',
          '300': '#68eeac',
          '400': '#47e195',
          '500': '#1fc876',
          '600': '#13a65e',
          '700': '#13824c',
          '800': '#146740',
          '900': '#135436',
          '950': '#042f1c',
        },
        yellow: {
          '50': '#f79139',
          '100': '#f79139',
          '200': '#f79139',
          '300': '#f79139',
          '400': '#f79139',
          '500': '#f79139',
          '600': '#f79139',
          '700': '#f79139',
          '800': '#f79139',
          '900': '#f79139',
          '950': '#f79139',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        theme: {
          50: '#fef4eb',
          100: '#fdddc2',
          200: '#fbcca4',
          300: '#fab57a',
          400: '#f9a761',
          500: '#f79139',
          600: '#e18434',
          700: '#af6728',
          800: '#88501f',
          900: '#683d18'
        },
        type: {
          50: '#fffffd',
          100: '#fffffa',
          200: '#fffff8',
          300: '#fffff4',
          400: '#fffff2',
          500: '#ffffef',
          600: '#e8e8d9',
          700: '#b5b5aa',
          800: '#8c8c83',
          900: '#6b6b64'
        },
        'type-alt': {
          50: '#fffffb',
          100: '#fefdf2',
          200: '#fefdec',
          300: '#fefce3',
          400: '#fdfbdd',
          500: '#fdfad5',
          600: '#e6e4c2',
          700: '#b4b297',
          800: '#8b8a75',
          900: '#6a6959'
        }
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'slide-from-left': {
          '0%': {
            transform: 'translateX(-100%)'
          },
          '100%': {
            transform: 'translateX(0)'
          }
        },
        'slide-to-left': {
          '0%': {
            transform: 'translateX(0)'
          },
          '100%': {
            transform: 'translateX(-100%)'
          }
        }
      },
      animation: {
        'slide-from-left':
          'slide-from-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'slide-to-left':
          'slide-to-left 0.25s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      gridTemplateColumns: {
        // Simple 16 column grid
        16: 'repeat(16, minmax(0, 1fr))'
      }
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
export default config;
