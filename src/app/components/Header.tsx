'use client';

import { useState } from 'react';
import Link from 'next/link';
import GlobalSearch from './GlobalSearch';
import UserMenu from './UserMenu';
import { Menu, X } from 'lucide-react';
// 1. IMPORTAR os componentes do Avatar que vamos usar no atalho
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import DeckSageLogo from '../../../public/decksage.png'

type HeaderProps = {
  user: any;
  profile: any;
  fallbackInitial: string;
}

export default function Header({ user, profile, fallbackInitial }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative"> 
      <header className="w-full p-4 bg-gradient-to-r from-black via-neutral-900 to-black shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold text-amber-500 hover:text-amber-500 transition-colors">
            <Image
              src={DeckSageLogo}
              alt={'DeckSage'}
              width={140}
              className=""
              priority={true}
            />
          </Link>
          
          <div className="flex-1 px-4 hidden sm:block">
            <GlobalSearch />
          </div>

          <div className="hidden md:flex items-center">
            <UserMenu 
              user={user}
              profile={profile}
              fallbackInitial={fallbackInitial}
            />
          </div>

          {/* 2. MODIFICAR a div do menu mobile para alinhar os itens lado a lado */}
          <div className="md:hidden flex items-center gap-3">
            {/* 3. ADICIONAR o Avatar como um Link para o perfil (APENAS se o usuário existir) */}
            {user && (
              <Link href="/profile" onClick={handleLinkClick}>
                <Avatar className="h-10 w-10 border-2 border-neutral-600">
                  <AvatarImage src={profile.avatar_url ?? undefined} alt="Avatar do utilizador" />
                  <AvatarFallback className="bg-neutral-700 text-amber-500 font-bold">
                    {fallbackInitial.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}

            {/* O botão Hamburger continua aqui */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* O painel do menu mobile não precisa de alterações */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-neutral-900 shadow-xl z-40 p-4">
          <nav className="flex flex-col gap-4 text-center">
            <div className="px-4 py-2">
              <GlobalSearch />
            </div>

            <Link href="/" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
              Buscar
            </Link>
            <Link href="/collections" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
              Coleções
            </Link>
            <Link href="/glossary" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
              Glossário
            </Link>
             <Link href="/deck-analyzer" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
              Analise de Deck IA
            </Link>
            
            <hr className="border-neutral-700" />

            {user ? (
              <>
                <Link href="/profile" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
                  Editar Perfil
                </Link>
                <Link href="/my-decks" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
                  Meus Decks
                </Link>
                <Link href="/favorites" onClick={handleLinkClick} className="hover:text-amber-500 transition-colors text-lg py-2">
                  Favoritos
                </Link>
                 <button
                    onClick={() => {
                      // Você precisará implementar a função de signOut aqui também
                      // ou importá-la se estiver em um helper.
                      // Ex: const supabase = createClient(); await supabase.auth.signOut();
                      handleLinkClick();
                    }}
                    className="text-red-500 hover:text-red-400 text-lg py-2 w-full"
                  >
                    Sair
                  </button>
              </>
            ) : (
              <Link href="/login" onClick={handleLinkClick}>
                <button className="w-full bg-amber-500 text-black hover:bg-amber-600 px-4 py-2 rounded-lg">
                  Login
                </button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}