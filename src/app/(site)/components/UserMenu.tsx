/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, User, LogOut, Swords, ShieldCheck, Gift, Wand2, Library } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import ReferralLink from '@/app/(site)/components/ui/ReferralLink';
import UserPointsDisplay from '@/app/(site)/components/ui/UserPointsDisplay';

export default function UserMenu() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      setUserRole(profileData?.role || null);
    } else {
      setProfile(null);
      setUserRole(null);
    }
  };

  useEffect(() => {
    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetchUserData();
      router.refresh();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const fallbackInitial = profile?.full_name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <nav className="flex items-center gap-4 md:gap-6 text-neutral-200">
        <Link href="/collections" className="hover:text-amber-500 transition-colors text-sm sm:text-base">
          Guia por Coleções
        </Link>
        <Link href="/blog" className="hover:text-amber-500 transition-colors text-sm sm:text-base">
          Hub de Conteúdo
        </Link>
        <Link href="/glossary" className="hover:text-amber-500 transition-colors text-sm sm:text-base">
          Glossário
        </Link>
        {/* ADIÇÃO */}
        <Link href="/decks-ai" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-1">
            <Library size={16} /> Decks
        </Link>

        <Button asChild variant="secondary" size="sm" className="bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/20 h-9">
          <Link href="/ai-deck-builder" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden sm:inline">Crie Deck com IA</span>
            <span className="inline sm:hidden">IA</span>
          </Link>
        </Button>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-neutral-600 hover:border-amber-400 transition-colors">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt="Avatar do usuário" />
                  <AvatarFallback className="bg-neutral-700 text-amber-500 font-bold">{fallbackInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-neutral-900 border-neutral-700 text-neutral-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{profile?.full_name || user.user_metadata.full_name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-neutral-400">{user.email}</p>
                  <div className="pt-2">
                    <UserPointsDisplay points={profile?.points} size="sm" />
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center w-full"><User className="mr-2 h-4 w-4" /><span>Editar Perfil</span></Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/my-decks" className="flex items-center w-full"><Swords className="mr-2 h-4 w-4" /><span>Meus Decks</span></Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/favorites" className="flex items-center w-full"><Heart className="mr-2 h-4 w-4" /><span>Favoritos</span></Link>
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <>
                  <DropdownMenuSeparator className="bg-neutral-700" />
                  <DropdownMenuItem asChild className="text-amber-400">
                    <Link href="/admin" className="flex items-center w-full"><ShieldCheck className="mr-2 h-4 w-4" /><span>Painel Admin</span></Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem onSelect={() => setIsReferralDialogOpen(true)}>
                <Gift className="mr-2 h-4 w-4" /><span>Convidar um Amigo</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-700" />
              <DropdownMenuItem className="text-red-400" onSelect={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" /><span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login"><Button>Login</Button></Link>
        )}
      </nav>

      <Dialog open={isReferralDialogOpen} onOpenChange={setIsReferralDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-amber-400">Convide um Amigo e Ganhe Pontos!</DialogTitle>
            <DialogDescription>Compartilhe seu link exclusivo abaixo. Para cada amigo que se cadastrar, você ganha pontos.</DialogDescription>
          </DialogHeader>
          <div className="pt-4"><ReferralLink referralCode={profile?.referral_code || null} /></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
