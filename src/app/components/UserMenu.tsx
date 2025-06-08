/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Heart, User, LogOut, Swords, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';

type UserMenuProps = {
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  fallbackInitial: string;
  profile: Profile;
};

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
}

export default function UserMenu({ user, fallbackInitial, profile }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    console.log('Logout clicked');
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error.message);
      router.push(`/error?message=Logout+failed:${encodeURIComponent(error.message)}`);
    } else {
      router.push('/login');
    }
  };

  return (
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
        <Star size={16} /> Analise de Deck IA
      </Link>
      
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-neutral-600 hover:border-amber-400 transition-colors">
                <AvatarImage src={profile.avatar_url ?? undefined} alt="Avatar do utilizador" />
                <AvatarFallback className="bg-neutral-700 text-amber-400 font-bold">
                  {fallbackInitial.toUpperCase()}
                  
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-neutral-200" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.user_metadata.full_name || 'Utilizador'}</p>
                <p className="text-xs leading-none text-neutral-400">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-700" />
            <DropdownMenuItem asChild className="cursor-pointer hover:!bg-neutral-800 focus:!bg-neutral-800">
              <Link href="/profile" className="flex items-center w-full">
                <User className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:!bg-neutral-800 focus:!bg-neutral-800">
              <Link href="/my-decks" className="flex items-center w-full">
                <Swords className="mr-2 h-4 w-4" />
                <span>Meus Decks</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer hover:!bg-neutral-800 focus:!bg-neutral-800">
              <Link href="/favorites" className="flex items-center w-full">
                <Heart className="mr-2 h-4 w-4" />
                <span>Favoritos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-neutral-700" />
            <DropdownMenuItem
              className="cursor-pointer hover:!bg-neutral-800 focus:!bg-neutral-800"
              onSelect={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
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
  );
}