'use client'

import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Tipagem para os dados que o componente espera
type ProfileHeaderProps = {
  profile: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    cover_image_url: string | null;
    bio: string | null;
  } | null; // O perfil pode ser nulo se não for encontrado
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  // Lida com o caso de perfil não encontrado
  if (!profile) {
    return null; 
  }

  const fallbackInitial = profile.full_name?.charAt(0) || profile.username?.charAt(0) || '?';

  return (
    <header>
      {/* Imagem de Capa */}
      <div className="h-48 sm:h-64 bg-neutral-800 relative">
        {profile.cover_image_url ? (
          <Image 
            src={profile.cover_image_url} 
            alt={`Capa do perfil de ${profile.username}`}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-700"></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Container para Avatar e Informações */}
      <div className="container mx-auto px-6 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          
          {/* AJUSTE: O Avatar agora usa a estrutura correta do Shadcn/UI */}
          <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-neutral-950 bg-neutral-700 flex-shrink-0">
            <Avatar className="w-full h-full">
              <AvatarImage src={profile.avatar_url || ''} alt={`Avatar de ${profile.username}`} />
              <AvatarFallback className="text-4xl bg-neutral-700">
                {fallbackInitial.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="pb-4">
            <h1 className="text-3xl font-bold">{profile.full_name || 'Usuário'}</h1>
            <p className="text-amber-500">@{profile.username || 'username'}</p>
            {profile.bio && <p className="text-neutral-400 mt-2 text-sm max-w-xl">{profile.bio}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}