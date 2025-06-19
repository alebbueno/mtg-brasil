import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // ✨ Domínio adicionado para placeholders
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Domínio adicionado para as imagens de fallback
      },
      {
        protocol: 'https',
        hostname: 'irvppzfjscjphhnzxcxp.supabase.co', // Substitua se o ID do seu projeto for diferente
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io',
      },
      {
        protocol: 'https',
        hostname: 'c2.scryfall.com',
      },
      // Você pode adicionar outros domínios aqui se precisar
    ],
  },
  serverActions: {
    bodySizeLimit: '10mb', // Aumenta o limite para 10MB
  },
};

export default nextConfig;
