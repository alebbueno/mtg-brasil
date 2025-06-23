/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Heart, User, LogOut, Swords, Star, ShieldCheck, Gift } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import ReferralLink from '@/app/(site)/components/ui/ReferralLink';
import UserPointsDisplay from '@/app/(site)/components/ui/UserPointsDisplay'; // Importa nosso novo componente


// As props agora podem receber userRole e referral_code
type UserMenuProps = {
  user: {
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  fallbackInitial: string;
  profile: {
    full_name: string | null;
    avatar_url: string | null;
    referral_code?: string | null;
    points?: number | null;
  };
  userRole?: string;
};

export default function UserMenu({ user, fallbackInitial, profile, userRole }: UserMenuProps) {
  const router = useRouter();
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error.message);
    }
    // Força um reload completo para garantir que o estado do servidor seja atualizado
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav className="flex items-center gap-4 md:gap-6 text-neutral-200">
        <Link href="/" className="hover:text-amber-500 transition-colors text-sm sm:text-base">
          Buscar
        </Link>
        <Link href="/collections" className="hover:text-amber-500 transition-colors text-sm sm:text-base">
          Coleções
        </Link>
        <Link href="/blog" className="hover:text-amber-500 transition-colors text-sm sm:text-base flex items-center gap-1">
          <BookOpen size={16} /> Blog
        </Link>
        <Link href="/deck-analyzer" className="hover:text-amber-500 transition-colors text-sm sm:text-base flex items-center gap-1">
          <Star size={16} /> Analise de Deck IA
        </Link>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-neutral-600 hover:border-amber-400 transition-colors">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt="Avatar do utilizador" />
                  <AvatarFallback className="bg-neutral-700 text-amber-500 font-bold">
                    {fallbackInitial.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-neutral-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || user.user_metadata.full_name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-neutral-400">{user.email}</p>
                  {/* AJUSTE: Adicionamos o display de pontos aqui */}
                  <div className="pt-2">
                    <UserPointsDisplay points={profile?.points} size="sm" />
                  </div>
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
              
              {userRole === 'admin' && (
                <>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuItem asChild className="cursor-pointer text-amber-400 hover:!text-amber-300 hover:!bg-neutral-800 focus:!bg-neutral-800">
                    <Link href="/admin" className="flex items-center w-full">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Painel Admin</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator className="bg-neutral-700" />
              {/* AJUSTE: Corrigido de <ContextMenuItem> para <DropdownMenuItem> */}
              <DropdownMenuItem onSelect={() => setIsReferralDialogOpen(true)} className="cursor-pointer hover:!bg-neutral-800 focus:!bg-neutral-800">
                <Gift className="mr-2 h-4 w-4" />
                <span>Convidar um Amigo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem
                className="cursor-pointer text-red-400 hover:!text-red-300 hover:!bg-neutral-800 focus:!bg-neutral-800"
                onSelect={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
      
      <Dialog open={isReferralDialogOpen} onOpenChange={setIsReferralDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Convide um Amigo e Ganhe Pontos!</DialogTitle>
            <DialogDescription>
              Compartilhe seu link exclusivo abaixo. Para cada amigo que se cadastrar, você ganha pontos.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <ReferralLink referralCode={profile?.referral_code || null} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}