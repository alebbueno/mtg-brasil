/* eslint-disable jsx-a11y/iframe-has-title */
import 'mana-font/css/mana.css';
import './globals.css';
import type { Metadata } from 'next';
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import Script from 'next/script';
import { Toaster } from 'sonner';
import FloatingFeedback from './components/FloatingFeedback';
import { createClient } from '@/app/utils/supabase/server'; // <-- 1. IMPORTAR O SUPABASE SERVER CLIENT

export const metadata: Metadata = {
  title: 'DeckSage - Sua Plataforma de IA para Magic: The Gathering',
  description: 'Uma plataforma para jogadores de Magic: The Gathering no Brasil buscarem cartas, visualizarem informações e traduções rápidas.',
  icons: {
    icon: '/favicon.ico',
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// 2. TORNAR O LAYOUT ASSÍNCRONO PARA USAR AWAIT
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // 3. BUSCAR OS DADOS DO USUÁRIO E PERFIL NO SERVIDOR
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    profile = profileData;
  }

  const fallbackInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';

  return (
    <html lang="pt-BR" className="dark">
      <head>
        {GTM_ID && (
          <Script
            id="gtm-head"
            strategy="afterInteractive"
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
        className="bg-neutral-950 text-neutral-100 antialiased flex flex-col min-h-screen"
      >
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
        
        {/* 4. PASSAR OS DADOS COMO PROPS PARA O HEADER */}
        <Header 
          user={user ? { email: user.email || '', user_metadata: user.user_metadata } : null}
          profile={profile || { full_name: '', avatar_url: '' }}
          fallbackInitial={fallbackInitial}
        />
        
        <main className="flex-grow">{children}</main>
        <Footer />
        <FloatingFeedback />
      </body>
      <Toaster />
    </html>
  );
}