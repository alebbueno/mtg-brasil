// app/components/deck/DeckHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Globe, Lock, Pencil } from 'lucide-react';
import { DeckPrivacyToggle } from '@/app/(site)/components/deck/DeckPrivacyToggle';
import DeckViewActions from '@/app/(site)/components/deck/DeckViewActions';
import SaveDeckButton from '@/app/(site)/components/deck/SaveDeckButton';
import type { DeckFromDB } from '@/app/(site)/lib/types';
import Link from 'next/link';

interface DeckHeaderProps {
  deck: DeckFromDB;
  isOwner: boolean;
  isInitiallySaved: boolean;
}

export default function DeckHeader({ deck, isOwner, isInitiallySaved }: DeckHeaderProps) {
  const router = useRouter();

  return (
    <header className="mb-8">
      {/* A estrutura flex-col/sm:flex-row já é ótima */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <header className="flex flex-row items-center gap-4">
          <Link href="/my-decks">
            {/* AJUSTE: Botão de voltar um pouco menor no mobile para consistência */}
            <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </Link>
          <div>
            {/* AJUSTE: Tamanho da fonte responsivo para o título */}
            <h1 className="text-3xl sm:text-4xl font-bold text-amber-500 break-words">{deck.name}</h1>
            <div className="flex items-center gap-2 text-base sm:text-lg text-neutral-400 capitalize">
              <span>{deck.format}</span>
              <span className="text-neutral-600">•</span>
              {deck.is_public ? (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <Globe size={14} /> Público
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400 text-sm">
                  <Lock size={14} /> Privado
                </span>
              )}
            </div>
          </div>
        </header>
        
        {/* AJUSTE: Alinhamento dos botões e espaçamento responsivo */}
        <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-center">
          <DeckViewActions deck={deck} />
          <SaveDeckButton deckId={deck.id} initialIsSaved={isInitiallySaved} />
          {isOwner && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* AJUSTE: Botão de Editar agora é um ícone no mobile */}
              <Button
                variant="secondary"
                onClick={() => router.push(`/my-deck/${deck.format}/${deck.id}/edit`)}
                className="p-2 h-10 w-10 sm:h-auto sm:w-auto sm:px-4 sm:py-2" // Tamanho responsivo
              >
                <Pencil className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
              <Card className="bg-neutral-800 p-2 flex items-center justify-center">
                <DeckPrivacyToggle deckId={deck.id} initialIsPublic={deck.is_public} />
              </Card>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}