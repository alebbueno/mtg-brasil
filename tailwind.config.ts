/* eslint-disable no-undef */
import type { Config } from 'tailwindcss';

const config = {
  // AJUSTE 1: A linha darkMode foi descomentada para ativar o tema escuro.
  darkMode: "class",
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
        "fade-in-down": {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-in-up": {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
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
        // AJUSTE 2: Adicionada a palavra-chave 'forwards' para manter o estado final da animação.
        "fade-in-down": "fade-in-down 0.8s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: (theme: any) => ({
        invert: {
          css: {
            '--tw-prose-body': theme('colors.neutral[300]'),
            '--tw-prose-headings': theme('colors.amber[400]'),
            '--tw-prose-links': theme('colors.amber[500]'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-bullets': theme('colors.amber[500]'),
            '--tw-prose-hr': theme('colors.neutral[800]'),
            '--tw-prose-quotes': theme('colors.amber[400]'),
            '--tw-prose-quote-borders': theme('colors.amber[500]'),
            '--tw-prose-th-borders': theme('colors.neutral[600]'),
            '--tw-prose-td-borders': theme('colors.neutral[700]'),
            
            p: { lineHeight: '1.8' },
            'h2, h3, h4': { color: theme('colors.amber.400'), fontWeight: '700' },
            a: {
                color: theme('colors.amber.500'),
                fontWeight: '600',
                textDecoration: 'none',
                '&:hover': { color: theme('colors.amber.300'), textDecoration: 'underline' },
            },
            'ul > li::before': { display: 'none' },
            'ol > li::before': { color: theme('colors.neutral.400') },
            img: {
              width: '100%',
              borderRadius: theme('borderRadius.xl'),
              marginTop: '2em',
              marginBottom: '2em',
            },
            table: { width: '100%' },
            'thead': { backgroundColor: theme('colors.neutral.800') },
            'thead th': { color: theme('colors.white') },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ],
} satisfies Config;

export default config;