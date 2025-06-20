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
  // --- INÍCIO DA ADIÇÃO: Configuração de Cabeçalhos (CORS) ---
  async headers() {
    return [
      {
        // Aplica estas regras a todas as rotas dentro de /api/
        source: "/api/:path*",
        headers: [
          // Permite que o seu domínio principal acesse a API
          { 
            key: "Access-Control-Allow-Origin", 
            value: "https://decksage.com.br"
          },
          // Define os métodos HTTP permitidos
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
          },
          // Define os cabeçalhos permitidos na requisição
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, content-type, Authorization",
          },
        ],
      },
    ];
  },
  // --- FIM DA ADIÇÃO ---
};

export default nextConfig;
