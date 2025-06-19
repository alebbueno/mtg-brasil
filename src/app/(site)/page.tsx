/* eslint-disable no-undef */
/* eslint-disable no-console */
// Home.tsx (app/page.tsx ou similar)
import HeroSection from "@/app/(site)/components/home/HeroSection";
import FeatureShowcaseSection from "@/app/(site)/components/home/FeatureShowcaseSection";
// import FeaturedCardsSection from "@/app/components/home/FeaturedCardsSection";
import LatestSetsSection from "@/app/(site)/components/home/LatestSetsSection";
import ManaColorNavigationSection from "@/app/(site)/components/home/ManaColorNavigationSection";
import { fetchLatestSets, SetData } from "./lib/scryfall"; // << IMPORTANTE: Adicionei SetData aqui
import DailyDecksSection from "./components/home/DailyDecksSection";

// Dados mockados para exemplo - substitua por dados reais/API
// Interface para FeaturedCardData, se você precisar (para mockFeaturedCards)
// interface FeaturedCardData {
//   id: string;
//   name: string;
//   imageUrl: string;
//   set: string;
// }


export default async function Home() {
  console.log("Home: Iniciando renderização do Server Component.");
  let latestSetsData: SetData[] = []; // A interface SetData é usada aqui
  try {
    latestSetsData = await fetchLatestSets(10); // Use a contagem menor para teste
    console.log("Home: Dados de latestSetsData recebidos:", latestSetsData ? latestSetsData.length : 'undefined/null');
  } catch (e: any) {
    console.error("Home: Erro ao chamar fetchLatestSets:", e.message, e.stack); // Adicionado e.stack para mais detalhes
    // latestSetsData permanecerá como []
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <main className="flex-1 w-full">
        <HeroSection />
        <FeatureShowcaseSection />

        <DailyDecksSection />

        <LatestSetsSection sets={latestSetsData} /> {/* Passe os dados como props */}
        
        <div className="container mx-auto p-6">
          {/* Seção combinada para Coleções e Cores */}
          <ManaColorNavigationSection />
        </div>
      </main>
    </div>
  );
}