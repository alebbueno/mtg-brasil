// app/components/deck/DeckHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Globe, Lock, Pencil } from 'lucide-react';
import { DeckPrivacyToggle } from '@/app/components/deck/DeckPrivacyToggle';
import DeckViewActions from '@/app/components/deck/DeckViewActions';
import SaveDeckButton from '@/app/components/deck/SaveDeckButton';
import type { DeckFromDB } from '@/app/lib/types';
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <header className="flex flex-row gap-4">
          <Link href="/my-decks">
            <Button variant="outline" size="icon" className="h-12 w-12">
                <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-amber-500">{deck.name}</h1>
            <div className="flex items-center gap-2 text-lg text-neutral-400 capitalize">
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
        
        
        <div className="flex items-center gap-4">
          <DeckViewActions deck={deck} />
          <SaveDeckButton deckId={deck.id} initialIsSaved={isInitiallySaved} />
          {isOwner && (
            <div className="flex gap-2">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push(`/my-deck/${deck.format}/${deck.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Card className="bg-neutral-800 p-2">
                <DeckPrivacyToggle deckId={deck.id} initialIsPublic={deck.is_public} />
              </Card>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
