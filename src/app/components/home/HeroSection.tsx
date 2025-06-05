// app/components/home/HeroSection.tsx
import SearchBar from "@/app/components/SearchBar";

export default function HeroSection() {
  return (
    <section className="py-16 md:py-24 text-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-amber-400 mb-4 animate-fade-in-down">
          MTG Translate
        </h1>
        <p className="text-neutral-300 text-lg sm:text-xl md:text-2xl mb-10 animate-fade-in-up max-w-2xl mx-auto">
          Sua ferramenta completa para buscar, traduzir e explorar o universo de Magic: The Gathering.
        </p>
        <div className="max-w-2xl mx-auto">
          <SearchBar />
        </div>
        <p className="mt-6 text-neutral-400 text-sm">
          Digite o nome de uma carta em qualquer idioma para ver detalhes e tradução.
        </p>
      </div>
    </section>
  );
}