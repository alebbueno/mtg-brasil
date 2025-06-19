/* eslint-disable no-undef */
import type { Config } from 'tailwindcss';

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // --- INÍCIO DA ADIÇÃO DA TIPOGRAFIA ---
      typography: (theme: any) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.neutral[300]'),
            '--tw-prose-headings': theme('colors.amber[400]'),
            '--tw-prose-links': theme('colors.amber[400]'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-bullets': theme('colors.amber[500]'),
            '--tw-prose-hr': theme('colors.neutral[800]'),
            '--tw-prose-quotes': theme('colors.neutral[300]'),
            '--tw-prose-quote-borders': theme('colors.amber[500]'),
            '--tw-prose-th-borders': theme('colors.neutral[600]'),
            '--tw-prose-td-borders': theme('colors.neutral[700]'),

            // Estilos customizados para os elementos do artigo
            p: { lineHeight: '1.8' },
            'h2, h3, h4': {
              color: theme('colors.amber.400'),
              fontWeight: '700',
              scrollMarginTop: theme('spacing.20'),
            },
            a: {
              color: theme('colors.amber.500'),
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.2s ease-in-out',
              '&:hover': {
                color: theme('colors.amber.300'),
                textDecoration: 'underline',
              },
            },
            'ol > li::before': {
              color: theme('colors.neutral.400'),
              fontWeight: 'bold',
            },
            'ul > li::before': {
              content: '""',
              position: 'absolute',
              backgroundColor: theme('colors.amber.500'),
              borderRadius: '50%',
              width: '0.375em',
              height: '0.375em',
              top: 'calc(0.875em - 0.1875em)',
              left: '0.25em',
            },
            img: {
              width: '100%',
              borderRadius: theme('borderRadius.xl'),
              marginTop: '2em',
              marginBottom: '2em',
              border: `1px solid ${theme('colors.neutral.800')}`,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            table: {
              width: '100%',
              fontSize: theme('fontSize.sm'),
            },
            thead: {
              backgroundColor: theme('colors.neutral[800]'),
              borderBottomColor: theme('colors.neutral[600]'),
            },
            'thead th': {
              color: theme('colors.white'),
              padding: '0.75rem',
              textAlign: 'left',
            },
            'tbody tr': {
              borderBottomColor: theme('colors.neutral[800]'),
            },
            'tbody tr:last-child': {
              borderBottom: 'none',
            },
            'td, th': {
              padding: '0.75rem',
            },
          },
        },
      }),
      // --- FIM DA ADIÇÃO DA TIPOGRAFIA ---
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // ADIÇÃO: O plugin de tipografia é essencial para que a configuração acima funcione.
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

export default config;