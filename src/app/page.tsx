/* eslint-disable no-undef */
/* eslint-disable no-console */
// Home.tsx (app/page.tsx ou similar)
import HeroSection from "@/app/components/home/HeroSection";
import FeatureShowcaseSection from "@/app/components/home/FeatureShowcaseSection";
import FeaturedCardsSection from "@/app/components/home/FeaturedCardsSection";
import LatestSetsSection from "@/app/components/home/LatestSetsSection";
import ManaColorNavigationSection from "@/app/components/home/ManaColorNavigationSection";
import { fetchLatestSets, SetData } from "./lib/scryfall"; // << IMPORTANTE: Adicionei SetData aqui

// Dados mockados para exemplo - substitua por dados reais/API
// Idealmente, esses dados viriam de um fetch no nível da página ou em Server Components
const mockFeaturedCards = [
  { id: "1", name: "Sheoldred, a Apocalipse", imageUrl: "https://cards.scryfall.io/art_crop/front/d/6/d67be074-cdd4-41d9-ac89-0a0456c4e4dd.jpg", set: "DMU" },
  { id: "2", name: "Atraxa, Grã-Unificadora", imageUrl: "https://cards.scryfall.io/art_crop/front/d/0/d0d33d52-3d28-4675-b561-215032d9a205.jpg", set: "ONE" },
  { id: "3", name: "Ragavan, Pilhador Ágil", imageUrl: "https://cards.scryfall.io/art_crop/front/9/c/9c702650-bfd3-45e7-90c4-958a38ee5183.jpg", set: "MH2" },
];

// Interface para FeaturedCardData, se você precisar (para mockFeaturedCards)
interface FeaturedCardData {
  id: string;
  name: string;
  imageUrl: string;
  set: string;
}


export default async function Home() {
  console.log("Home: Iniciando renderização do Server Component.");
  let latestSetsData: SetData[] = []; // A interface SetData é usada aqui
  try {
    latestSetsData = await fetchLatestSets(3); // Use a contagem menor para teste
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
        <FeaturedCardsSection cards={mockFeaturedCards as FeaturedCardData[]} /> {/* Passe os dados como props, com type assertion se necessário */}
        
        {/* Seção combinada para Coleções e Cores */}
        <section className="py-12 md:py-20 bg-neutral-900">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-x-12 gap-y-16 items-start">
              <LatestSetsSection sets={latestSetsData} /> {/* Passe os dados como props */}
              <ManaColorNavigationSection />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}