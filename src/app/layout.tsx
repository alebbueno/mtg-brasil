/* eslint-disable jsx-a11y/iframe-has-title */
import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'MTG Brasil - Busque e Traduza Cartas de Magic',
  description: 'Uma plataforma para jogadores de Magic: The Gathering no Brasil buscarem cartas, visualizarem informações e traduções rápidas.',
  icons: {
    icon: '/favicon.ico',
  },
};


// É uma boa prática armazenar seu ID do GTM em uma variável de ambiente
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
         {/* Script do GTM para o <head> */}
        {GTM_ID && (
          <Script
            id="gtm-head"
            strategy="afterInteractive" // Carrega após a página se tornar interativa
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        )}
      </head>
      <body
        className={` bg-neutral-950 text-neutral-100 antialiased flex flex-col min-h-screen`}
      >
        {/* Snippet do GTM <noscript> para o <body> */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            ></iframe>
          </noscript>
        )}
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}