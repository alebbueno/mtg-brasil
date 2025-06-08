// Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import GlobalSearch from './GlobalSearch';
import { Button } from '@/components/ui/button';
import { createClient } from '@/app/utils/supabase/server'; // Helper do Supabase para o servidor
import { BookOpen, Heart } from 'lucide-react';

export default async function Header() {
  // Cria um cliente Supabase no lado do servidor para buscar o usuário
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="w-full p-4 bg-gradient-to-r from-black via-neutral-900 to-black shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-amber-400 hover:text-amber-500 transition-colors">
          🧙 MTG Translate
        </Link>
        
        <div className="flex-1 px-4 lg:px-8">
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
          
          {user ? (
            // Exibe se o usuário ESTIVER logado
            <div className="flex items-center gap-4">
              <Link href="/favorites" className="hover:text-amber-400 transition-colors text-sm sm:text-base flex items-center gap-1">
                <Heart size={16} /> Favoritos
              </Link>
              <div className="flex items-center gap-2">
                {user.user_metadata.avatar_url && (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="Avatar do usuário"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-neutral-600"
                  />
                )}
                <form action="/auth/sign-out" method="post">
                  <Button
                    type="submit"
                    variant="outline"
                    className="text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black px-3 py-1 text-sm"
                  >
                    Sair
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            // Exibe se o usuário NÃO ESTIVER logado
            <Link href="/login">
              <Button
                variant="default"
                className="bg-amber-500 text-black hover:bg-amber-600 px-4 py-2"
              >
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}