'use client';

import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Pencil, PlayCircle, Copy, Loader2 } from 'lucide-react';
import { DeckPrivacyToggle } from '@/app/(site)/components/deck/DeckPrivacyToggle';
import DeckViewActions from '@/app/(site)/components/deck/DeckViewActions';
import SaveDeckButton from '@/app/(site)/components/deck/SaveDeckButton';
import type { DeckFromDB, CreatorProfile } from '@/app/lib/types';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { cloneDeck } from '@/app/actions/deckActions'; // Importa a nova action

// Botão de submissão para a ação de copiar, com estado de loading
function CloneButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" variant="outline" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Copy className="mr-2 h-4 w-4" />}
            Copiar Deck
        </Button>
    )
}

// AJUSTE: A interface de props agora recebe também o usuário logado
interface DeckHeaderProps {
  deck: DeckFromDB;
  isOwner: boolean;
  isInitiallySaved: boolean;
  creatorProfile: CreatorProfile | null;
  currentUser: User | null;
}

export default function DeckHeader({ deck, isOwner, isInitiallySaved, creatorProfile, currentUser }: DeckHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-row items-center gap-4">
          <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-500 break-words">{deck.name}</h1>
            <div className="flex items-center gap-2 text-base sm:text-lg text-neutral-400 capitalize">
              <span>{deck.format}</span>
              {/* Mostra o criador do deck */}
              {creatorProfile && (
                <>
                    <span className="text-neutral-600">•</span>
                    <span>por <Link href={`/profile/${creatorProfile.username || creatorProfile.id}`} className="hover:text-amber-400">{creatorProfile.full_name || creatorProfile.username}</Link></span>
                </>
              )}
            </div>
          </div>
        </div>
        
        
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center">
          <Link href={`/my-deck/${deck.format}/${deck.id}/playtest`}>
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <PlayCircle className="mr-2 h-5 w-5" />
              Testar
            </Button>
          </Link>
          
          <SaveDeckButton deckId={deck.id} initialIsSaved={isInitiallySaved} />

          {/* AJUSTE: O botão de copiar aparece aqui se você não for o dono */}
          {currentUser && !isOwner && (
            <form action={cloneDeck.bind(null, deck.id)}>
                <CloneButton />
            </form>
          )}

          {isOwner ? (
            // Se for o dono, mostra os botões de edição
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => router.push(`/my-decks/edit/${deck.id}`)}>
                <Pencil className="mr-0 sm:mr-2 h-5 w-5" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Card className="bg-neutral-800 p-2 flex items-center justify-center">
                <DeckPrivacyToggle deckId={deck.id} initialIsPublic={deck.is_public} />
              </Card>
            </div>
          ) : (
            // Se não for o dono, mostra as outras ações (como denunciar)
             <DeckViewActions deck={deck} />
          )}
        </div>
      </div>
    </header>
  );
}