import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'MTG Brasil - Busque e Traduza Cartas de Magic',
  description: 'Uma plataforma para jogadores de Magic: The Gathering no Brasil buscarem cartas, visualizarem informações e traduções rápidas.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={` bg-neutral-950 text-neutral-100 antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}