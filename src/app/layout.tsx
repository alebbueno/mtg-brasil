/* eslint-disable no-undef */
// app/layout.tsx (O layout RAIZ, minimalista)

import './globals.css';
import 'mana-font/css/mana.css';
import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import GTM from './utils/analytics/GTM';

export const metadata: Metadata = {
  title: 'MTG Brasil - Busque e Traduza Cartas de Magic',
  description: 'Uma plataforma para jogadores de Magic: The Gathering no Brasil.',
  icons: { icon: '/favicon.ico' },
};

const GTM_ID = 'GTM-WBDZV8XS'; // Coloque seu GTM ID aqui

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        <head>
          {/* Injeta o Script do GTM */}
          <GTM gtmId={GTM_ID} />
          <meta name="google-adsense-account" content="ca-pub-9935800504955016"></meta>
        </head>
        {/* ESTA LINHA É A MAIS IMPORTANTE! */}
        {/* Se ela estiver faltando, sua página ficará em branco. */}
        {children}
        
        <Toaster richColors />
      </body>
    </html>
  );
}