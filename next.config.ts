import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Configura um tempo de cache longo (31 dias) para reduzir reotimizações
    minimumCacheTTL: 2678400,
    // Limita as qualidades das imagens para reduzir transformações
    qualities: [60, 80],
    // Define tamanhos específicos para dispositivos, evitando múltiplas variações
    deviceSizes: [640, 828, 1080, 1200],
    // Mantém os padrões de URLs externas para processar apenas imagens específicas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com', // ✨ Domínio para placeholders
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Domínio para imagens de fallback
      },
      {
        protocol: 'https',
        hostname: 'irvppzfjscjphhnzxcxp.supabase.co', // Supabase
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**', // Google images
      },
      {
        protocol: 'https',
        hostname: 'cards.scryfall.io', // Scryfall
      },
      {
        protocol: 'https',
        hostname: 'c2.scryfall.com', // Scryfall
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '10mb', // Mantém o limite para 10MB
  },
  // Mantém a configuração de cabeçalhos (CORS) inalterada
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { 
            key: "Access-Control-Allow-Origin", 
            value: "https://decksage.com.br"
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, content-type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;