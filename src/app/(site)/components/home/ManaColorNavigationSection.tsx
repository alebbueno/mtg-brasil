import ManaColorLink from './ManaColorLink';

const manaColorsData = [
  { symbol: "W", name: "Branco", textColor: "text-stone-100", href: "/search?colors=W" },
  { symbol: "U", name: "Azul", textColor: "text-sky-400", href: "/search?colors=U" },
  { symbol: "B", name: "Preto", textColor: "text-neutral-400", href: "/search?colors=B" },
  { symbol: "R", name: "Vermelho", textColor: "text-red-500", href: "/search?colors=R" },
  { symbol: "G", name: "Verde", textColor: "text-green-500", href: "/search?colors=G" },
  { symbol: "C", name: "Incolor", textColor: "text-neutral-500", href: "/search?colors=C" },
  { symbol: "M", name: "Multicolor", textColor: "", href: "/search?colors=M" },
];

export default function ManaColorNavigationSection() {
  return (
    <section className="">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-amber-500 flex gap-3 uppercase tracking-wide">
            Navegue por Cor
          </h2>
          <p className="mt-4 text-base md:text-lg text-neutral-100 max-w-2xl mx-auto">
            Explore as cartas de Magic com base na identidade de cor e descubra novas sinergias para seus decks.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-8 max-w-5xl mx-auto">
          {manaColorsData.map((mana) => (
            <ManaColorLink
              key={mana.symbol}
              symbol={mana.symbol}
              name={mana.name}
              textColor={mana.textColor}
              href={mana.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
