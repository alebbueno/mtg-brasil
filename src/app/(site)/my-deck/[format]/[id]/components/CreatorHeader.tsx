'use client';

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link'; // Importa o Link

// AJUSTE: A tipagem do perfil agora espera também o ID
type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
};

export default function CreatorHeader({ profile }: { profile: Profile | null }) {
  if (!profile) return null;
  
  const fallbackInitial = profile.username?.charAt(0).toUpperCase() || '?';
  
  // Lógica para criar o link correto
  const profileUrl = `/profile/${profile.username || profile.id}`;

  return (
    <div className="mb-8 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
      <div className="relative h-24 sm:h-32 rounded-md overflow-hidden">
        {profile.cover_image_url ? (
          <Image src={profile.cover_image_url} unoptimized alt={`Capa do perfil de ${profile.username}`} fill className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-700" />
        )}
      </div>
      <div className="flex items-center -mt-8 ml-4 sm:-mt-10 sm:ml-6">
        {/* AJUSTE: O Avatar e o nome agora estão dentro de um Link */}
        <Link href={profileUrl} className="flex items-center group">
          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-neutral-900 group-hover:border-amber-500 transition-colors">
            <AvatarImage src={profile.avatar_url || ''} alt={`Avatar de ${profile.username}`} />
            <AvatarFallback className="text-2xl bg-neutral-700 text-amber-500">{fallbackInitial}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <p className="text-xs text-neutral-400">Criado por</p>
            <h3 className="text-lg font-bold text-amber-500 group-hover:underline">
              @{profile.username || 'Anônimo'}
            </h3>
          </div>
        </Link>
      </div>
    </div>
  );
}