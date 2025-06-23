/* eslint-disable no-undef */
/* eslint-disable no-console */
import HeroSection from "@/app/(site)/components/home/HeroSection";
import LatestSetsSection from "@/app/(site)/components/home/LatestSetsSection";
import ManaColorNavigationSection from "@/app/(site)/components/home/ManaColorNavigationSection";
import LatestPostsSection from "./components/home/LatestPostsSection";
// ADIÇÃO 1: Importa nosso novo componente de anúncio dinâmico
import DynamicAdSlot from "@/app/(site)/components/ads/DynamicAdSlot";

import { createClient } from "@/app/utils/supabase/server";
import { fetchLatestSets } from "@/app/lib/scryfall";

export default async function Home() {
  const supabase = createClient();
  console.log("Home: Iniciando renderização do Server Component.");

  // ADIÇÃO 2: A busca de dados agora também pega a configuração do anúncio
  const [
    latestSetsData, 
    { data: postsData, error: postsError },
    { data: adConfig, error: adError }
  ] = await Promise.all([
    fetchLatestSets(3),
    supabase.rpc('get_latest_published_posts', { post_limit: 3 }),
    supabase
      .from('ad_slots')
      .select('*')
      .eq('slot_name', 'banner_home') // Identificador único do nosso slot
      .eq('is_active', true)
      .maybeSingle()
  ]);
  
  if (postsError) {
    console.error("Home: Erro ao buscar posts para a homepage com RPC:", postsError);
  }
  if (adError) {
    console.error("Home: Erro ao buscar configuração de anúncio:", adError);
  }
  
  console.log("Home: Dados de latestSetsData recebidos:", latestSetsData ? latestSetsData.length : 'null');


  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <main className="flex-1 w-full">
        <HeroSection />

        <LatestPostsSection posts={postsData || []} />

        {/* --- ADIÇÃO 3: Seção do Anúncio Dinâmico --- */}
        <section className="container mx-auto px-6 py-16 flex justify-center">
          <DynamicAdSlot adConfig={adConfig} />
        </section>

        <div className="bg-neutral-900">
          <div className="container mx-auto py-16 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              
              <div className="lg:col-span-5">
                <ManaColorNavigationSection />
              </div>

              <div className="lg:col-span-7">
                <LatestSetsSection sets={latestSetsData || []} />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}