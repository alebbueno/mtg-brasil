import Link from 'next/link';
import Image from 'next/image';
import AdSenseBanner from './AdSenseBanner'; // Reutilizamos o componente que já criamos

// Tipagem para os dados de configuração que vêm do banco de dados
type AdConfig = {
  ad_type: 'adsense' | 'custom';
  adsense_client_id?: string | null;
  adsense_slot_id?: string | null;
  custom_image_url?: string | null;
  custom_link_url?: string | null;
  custom_alt_text?: string | null;
}

export default function DynamicAdSlot({ adConfig }: { adConfig: AdConfig | null }) {
  // Se não houver configuração ou estiver inativo, não renderiza nada
  if (!adConfig) {
    return null;
  }

  // Renderiza o anúncio do AdSense
  if (adConfig.ad_type === 'adsense' && adConfig.adsense_client_id && adConfig.adsense_slot_id) {
    return (
      <AdSenseBanner
        dataAdClient={adConfig.adsense_client_id}
        dataAdSlot={adConfig.adsense_slot_id}
        style={{ display: 'inline-block', width: '970px', height: '90px' }}
      />
    );
  }

  // Renderiza o anúncio particular (custom)
  if (adConfig.ad_type === 'custom' && adConfig.custom_image_url && adConfig.custom_link_url) {
    return (
      <Link href={adConfig.custom_link_url} target="_blank" rel="noopener noreferrer">
        <Image
          src={adConfig.custom_image_url}
          alt={adConfig.custom_alt_text || 'Anúncio'}
          width={970}
          height={90}
          unoptimized
          className="rounded-lg object-cover"
        />
      </Link>
    );
  }

  // Se a configuração estiver incompleta, não renderiza nada
  return null;
}