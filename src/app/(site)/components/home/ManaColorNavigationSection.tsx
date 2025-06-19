// app/components/home/ManaColorNavigationSection.tsx
import ManaColorLink from './ManaColorLink';
import { Palette } from 'lucide-react'; // Ícone para o título

// Dados para os links de navegação por cor, incluindo Incolor e Multicolor
const manaColorsData = [
  { symbol: "W", name: "Branco", gradient: "from-yellow-100 to-gray-200" },
  { symbol: "U", name: "Azul", gradient: "from-blue-300 to-cyan-400" },
  { symbol: "B", name: "Preto", gradient: "from-gray-600 to-black" },
  { symbol: "R", name: "Vermelho", gradient: "from-red-500 to-orange-400" },
  { symbol: "G", name: "Verde", gradient: "from-green-400 to-lime-500" },
  { symbol: "C", name: "Incolor", gradient: "from-gray-400 to-gray-500" },
  { symbol: "M", name: "Multicolor", gradient: "from-amber-400 to-fuchsia-500" },
];

export default function ManaColorNavigationSection() {
  return (
    <section className="py-16 sm:py-20 ">
      <div className="container mx-auto px-4">
        {/* Cabeçalho da Secção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-amber-500 flex items-center justify-center gap-3">
            <Palette />
            Navegue por Cor
          </h2>
          <p className="mt-3 text-lg text-neutral-400 max-w-2xl mx-auto">
            Explore cartas com base na sua identidade de cor e descubra novas sinergias.
          </p>
        </div>

        {/* Grelha de Navegação Responsiva */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 max-w-5xl mx-auto">
          {manaColorsData.map(mana => (
            <ManaColorLink
              key={mana.symbol}
              symbol={mana.symbol}
              name={mana.name}
              gradient={mana.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
