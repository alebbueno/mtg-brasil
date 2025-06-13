import Link from 'next/link';

export default async function CollectionsPage() {
  const res = await fetch('https://api.scryfall.com/sets');
  const data = await res.json();

  const sets = data.data.filter(
    (set: any) => set.set_type !== 'funny' && set.digital === false
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="p-4">
        <h1 className="text-4xl text-amber-500 mb-4">Coleções</h1>
      </header>
      <main className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        {sets.map((set: any) => (
          <Link key={set.code} href={`/collections/${set.code}`}>
            <div className="bg-neutral-900 rounded-xl hover:scale-105 transition p-4 flex flex-col items-center">
              <img
                src={set.icon_svg_uri}
                alt={set.name}
                className="w-16 h-16 mb-2"
              />
              <h2 className="text-lg text-amber-500 text-center">{set.name}</h2>
              <p className="text-xs text-neutral-400">{set.released_at}</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
