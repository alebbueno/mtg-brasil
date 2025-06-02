import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full p-4 bg-gradient-to-r from-black via-neutral-900 to-black shadow-lg">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-amber-400">
          🧙 MTG Translate
        </Link>
        <nav className="flex gap-6 text-neutral-200">
          <Link href="/">Buscar</Link>
          <Link href="/collections">Coleções</Link>
          <Link href="/favorites">Favoritos</Link>
        </nav>
      </div>
    </header>
  );
}
