/* eslint-disable no-undef */
import type { Config } from 'tailwindcss';

const config = {
  // ... (outras configurações como darkMode, content, etc.)
  theme: {
    // ... (outras configurações de tema)
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: "hsl(var(--primary))", // ✨ Aponta para a variável CSS
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... (as suas outras cores, como as de mana, permanecem aqui)
      },
      // ... (o resto das suas extensões de tema)
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
