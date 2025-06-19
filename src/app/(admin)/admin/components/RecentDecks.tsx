'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

// AJUSTE: A tipagem agora reflete que 'profiles' pode ser nulo,
// e as propriedades dentro dele também podem ser nulas.
type RecentDeck = {
  id: string;
  name: string;
  format: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null; // O perfil inteiro pode ser nulo
}

export default function RecentDecks({ decks }: { decks: RecentDeck[] }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle>Decks Criados Recentemente</CardTitle>
        <CardDescription>Os últimos 5 decks adicionados à plataforma.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {decks && decks.length > 0 ? decks.map(deck => (
          <div key={deck.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={deck.profiles?.avatar_url || ''} />
                <AvatarFallback>{deck.profiles?.username?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/my-deck/${deck.format}/${deck.id}`} className="font-semibold text-neutral-100 hover:text-amber-400 transition-colors">{deck.name}</Link>
                <p className="text-xs text-neutral-400">por @{deck.profiles?.username || 'anônimo'}</p>
              </div>
            </div>
            <span className="text-sm font-medium text-neutral-500 capitalize">{deck.format}</span>
          </div>
        )) : (
          <p className="text-sm text-center py-4 text-neutral-500">Nenhum deck recente encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
}