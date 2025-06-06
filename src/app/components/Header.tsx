// Header.tsx
import Link from 'next/link';
import GlobalSearch from './GlobalSearch'; // Mantenha seu componente GlobalSearch
import { BookOpen } from 'lucide-react'; // Ícones para novos links (opcional)

export default function Header() {
  return (
    <header className="w-full p-4 bg-gradient-to-r from-black via-neutral-900 to-black shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto"> {/* Max-width aumentado um pouco */}
        <Link href="/" className="text-2xl font-bold text-amber-400 hover:text-amber-500 transition-colors">
          🧙 MTG Translate
        </Link>
        
        <div className="flex-1 px-4 lg:px-8"> {/* Espaço para o GlobalSearch crescer um pouco */}
          <GlobalSearch />
        </div>

        <nav className="flex items-center gap-4 md:gap-6 text-neutral-200">
          <Link href="/" className="hover:text-amber-400 transition-colors text-sm sm:text-base">
            Buscar
          </Link>
          <Link href="/collections" className="hover:text-amber-400 transition-colors text-sm sm:text-base">
            Coleções
          </Link>
          <Link href="/glossary" className="hover:text-amber-400 transition-colors text-sm sm:text-base flex items-center gap-1">
            <BookOpen size={16} /> Glossário
          </Link>
          <Link href="/deck-analyzer" className="hover:text-amber-400 transition-colors text-sm sm:text-base flex items-center gap-1">
            <BookOpen size={16} /> Analise de Deck IA
          </Link>
          {/* <Link href="/favorites" className="hover:text-amber-400 transition-colors text-sm sm:text-base">
            Favoritos
          </Link>
          <Link href="/about" className="hover:text-amber-400 transition-colors text-sm sm:text-base flex items-center gap-1">
            <Info size={16} /> Sobre
          </Link> */}
          {/* Futuramente: Link para Login/Perfil */}
        </nav>
      </div>
    </header>
  );
}