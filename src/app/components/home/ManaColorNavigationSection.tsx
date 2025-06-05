// app/components/home/ManaColorNavigationSection.tsx
import ManaColorLink from './ManaColorLink';

// Defina as cores e símbolos de mana como uma constante
const manaColorsData = [
  { color: "W", name: "Branco", bgColor: "bg-mana-white", textColor: "text-black", symbolChar: "W" },
  { color: "U", name: "Azul", bgColor: "bg-mana-blue", textColor: "text-black", symbolChar: "U" },
  { color: "B", name: "Preto", bgColor: "bg-mana-black", textColor: "text-white", symbolChar: "B" },
  { color: "R", name: "Vermelho", bgColor: "bg-mana-red", textColor: "text-black", symbolChar: "R" },
  { color: "G", name: "Verde", bgColor: "bg-mana-green", textColor: "text-black", symbolChar: "G" },
  // { color: "C", name: "Incolor", bgColor: "bg-gray-400", textColor: "text-black", symbolChar: "C" }, // Exemplo para Incolor
];

export default function ManaColorNavigationSection() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-amber-400 mb-8">Navegue por Cor</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
        {manaColorsData.map(mana => (
          <ManaColorLink
            key={mana.color}
            color={mana.color}
            name={mana.name}
            bgColor={mana.bgColor}
            textColor={mana.textColor}
            symbolChar={mana.symbolChar}
          />
        ))}
      </div>
      <p className="mt-8 text-neutral-400">
        Descubra cartas e estratégias associadas a cada cor icônica do Magic.
      </p>
    </div>
  );
}

// Lembre-se de definir as cores bg-mana-* em seu tailwind.config.js
// ex: mana: { white: '#F8F6D8', blue: '#AAE0FA', black: '#231F20', red: '#F9AA8F', green: '#9CD4A1' }