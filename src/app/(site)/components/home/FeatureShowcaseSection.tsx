// app/components/home/FeatureShowcaseSection.tsx
import FeatureCard from "./FeatureCard";
import { Wand2, Sparkles, BookCopy, Heart } from "lucide-react"; // Ícones

export default function FeatureShowcaseSection() {
  const features = [
    {
      icon: <Wand2 className="text-amber-500" size={28}/>,
      title: "Tradução Inteligente",
      description: "Traduções precisas mantendo os termos técnicos oficiais do Magic."
    },
    {
      icon: <Sparkles className="text-amber-500" size={28}/>,
      title: "Busca Avançada",
      description: "Filtre cartas por nome, texto, cor, tipo, raridade, coleção e mais."
    },
    {
      icon: <BookCopy className="text-amber-500" size={28}/>,
      title: "Glossário Integrado",
      description: "Entenda termos e mecânicas complexas com explicações claras."
    },
    {
      icon: <Heart className="text-amber-500" size={28}/>,
      title: "Coleção de Favoritos",
      description: "Salve suas cartas preferidas para acesso rápido e fácil."
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-neutral-900">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-amber-500 mb-12">
          Explore o Poder da Plataforma
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(feature => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}