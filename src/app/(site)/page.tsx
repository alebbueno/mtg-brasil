/* eslint-disable no-undef */
/* eslint-disable no-console */
import HeroSection from "@/app/(site)/components/home/HeroSection";
import FeatureShowcaseSection from "@/app/(site)/components/home/FeatureShowcaseSection";
import LatestSetsSection from "@/app/(site)/components/home/LatestSetsSection";
import ManaColorNavigationSection from "@/app/(site)/components/home/ManaColorNavigationSection";
import DailyDecksSection from "./components/home/DailyDecksSection";
import LatestPostsSection from "./components/home/LatestPostsSection";

import { createClient } from "@/app/utils/supabase/server";
import { fetchLatestSets } from "@/app/lib/scryfall";

export default async function Home() {
  const supabase = createClient();
  console.log("Home: Iniciando renderização do Server Component.");

  // AJUSTE: A busca de posts agora chama a nossa nova função RPC
  const [latestSetsData, { data: postsData, error: postsError }] = await Promise.all([
    fetchLatestSets(10),
    supabase.rpc('get_latest_published_posts', { post_limit: 3 })
  ]);
  
  if (postsError) {
    console.error("Home: Erro ao buscar posts para a homepage com RPC:", postsError);
  }
  
  console.log("Home: Dados de latestSetsData recebidos:", latestSetsData ? latestSetsData.length : 'undefined/null');


  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <main className="flex-1 w-full">
        <HeroSection />
        <FeatureShowcaseSection />
        <DailyDecksSection />
        <LatestPostsSection posts={postsData || []} />
        <LatestSetsSection sets={latestSetsData || []} />
        
        <div className="container mx-auto p-6">
          <ManaColorNavigationSection />
        </div>
      </main>
    </div>
  );
}