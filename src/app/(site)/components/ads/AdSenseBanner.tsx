/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { useEffect } from 'react';
import Script from 'next/script';

interface AdSenseBannerProps {
  dataAdClient: string;
  dataAdSlot: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdSenseBanner({ 
  dataAdClient, 
  dataAdSlot,
  className,
  style = { display: 'block' } // Estilo padrão do AdSense
}: AdSenseBannerProps) {

  useEffect(() => {
    try {
      // Esta linha "empurra" o anúncio para o slot após a página carregar
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, [dataAdSlot]); // Roda o efeito sempre que o slot do anúncio mudar

  return (
    <div className={className} key={dataAdSlot}>
      {/* O componente <Script> do Next.js carrega o script principal do AdSense
        de forma otimizada. Ele só será carregado uma vez por página.
      */}
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${dataAdClient}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {/* Este é o "slot" do anúncio, onde o banner aparecerá.
        Os dados vêm das props que passamos para o componente.
      */}
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={dataAdClient}
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}