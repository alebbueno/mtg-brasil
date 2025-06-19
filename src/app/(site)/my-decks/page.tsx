/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/my-decks/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/(site)/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Loader2, PlusCircle, Swords, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeckCardItem from './componentes/DeckCardItem' 
import DeckCardItemShared from './componentes/DeckCardItemShared' 
// AJUSTE: Importar componentes do Card para o nosso novo botão
import { Card, CardContent } from '@/components/ui/card';

// Tipagem para os dados de um deck criado pelo utilizador
type OwnDeck = {
  id: string;
  name: string;
  format: string;
  representative_card_image_url: string | null;
  created_at: string;
  view_count?: number;
  save_count?: number;
  color_identity?: string[];
}

// Tipagem para um deck guardado, que inclui o perfil do criador
type SavedDeck = OwnDeck & {
  profiles: {
    username: string | null;
    full_name: string | null;
  } | null;
}

export default function MyDecksPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myDecks, setMyDecks] = useState<OwnDeck[]>([])
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([])
  const [loading, setLoading] = useState(true)

  // Função para buscar os decks criados pelo utilizador
  const fetchMyDecks = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('decks')
      .select('id, name, format, representative_card_image_url, created_at, view_count, save_count, color_identity')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar meus decks:', error.message)
    } else {
      setMyDecks(data || [])
    }
  }, [supabase]);

  // Função para buscar decks guardados
  const fetchSavedDecks = useCallback(async (userId: string) => {
    try {
      const { data: savedRelations, error: savedError } = await supabase
        .from('saved_decks')
        .select('deck_id')
        .eq('user_id', userId);

      if (savedError) throw new Error(`Falha ao buscar relações de decks guardados: ${savedError.message}`);
      if (!savedRelations || savedRelations.length === 0) {
        setSavedDecks([]);
        return;
      }

      const savedDeckIds = savedRelations.map(r => r.deck_id);

      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select(`id, name, format, representative_card_image_url, created_at, view_count, save_count, color_identity, user_id`)
        .in('id', savedDeckIds);
        
      if (decksError) throw new Error(`Falha ao buscar detalhes dos decks: ${decksError.message}`);
      if (!decksData) {
        setSavedDecks([]);
        return;
      }

      const creatorIds = [...new Set(decksData.map(d => d.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', creatorIds);

      if (profilesError) throw new Error(`Falha ao buscar perfis dos criadores: ${profilesError.message}`);
      
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      const finalSavedDecks = decksData.map(deck => ({
        ...deck,
        profiles: profilesMap.get(deck.user_id) || null
      }));

      finalSavedDecks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSavedDecks(finalSavedDecks as SavedDeck[]);

    } catch (error: any) {
      console.error('Erro detalhado no processo de buscar decks guardados:', error.message);
      setSavedDecks([]);
    }
  }, [supabase]);


  const handleDeckDelete = useCallback((deckId: string) => {
    setMyDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    setSavedDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
  }, []);

  // Efeito para buscar todos os dados iniciais
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await Promise.all([
          fetchMyDecks(user.id),
          fetchSavedDecks(user.id)
        ]);
      } else {
        router.push('/login');
      }
      setLoading(false);
    }
    initialize();
  }, [supabase, router, fetchMyDecks, fetchSavedDecks]);

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-amber-500 mb-2">
              Meus Decks
            </h1>
            <p className="text-lg text-neutral-300">
              Crie, gira e analise as suas estratégias.
            </p>
          </div>
          <Link href="/my-deck/create" passHref>
            <Button className="mt-4 sm:mt-0 bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Novo Deck
            </Button>
          </Link>
        </header>

        <h2 className="text-3xl font-bold text-primary mb-6 border-b border-neutral-700 pb-2 flex items-center gap-2">
          <Swords /> Decks Criados por Si
        </h2>
        {/* AJUSTE: Removida a condição de myDecks.length > 0 para sempre mostrar o grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* AJUSTE: Card de "Criar Novo Deck" adicionado como primeiro item */}
          <Link href="/my-deck/create" passHref>
            <Card className="bg-neutral-900 border-2 border-dashed border-neutral-700 h-full flex flex-col group transition-all duration-300 hover:border-amber-500 hover:bg-neutral-800 cursor-pointer">
              <CardContent className="p-4 flex flex-col flex-grow items-center justify-center text-center">
                <PlusCircle className="h-12 w-12 text-neutral-600 group-hover:text-amber-500 transition-colors" />
                <p className="mt-4 font-semibold text-lg text-neutral-400 group-hover:text-amber-400 transition-colors">
                  Criar Novo Deck
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* O map dos decks existentes continua igual, vindo logo após */}
          {myDecks.map((deck) => (
            <DeckCardItem key={deck.id} deck={deck} onDelete={handleDeckDelete} />
          ))}
        </div>
        
        {/* Secção Decks Guardados (sem alterações) */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-primary mb-6 border-b border-neutral-700 pb-2 flex items-center gap-2">
            <Bookmark /> Decks Guardados 
          </h2>
          {savedDecks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedDecks.map((deck) => {
                const creatorDisplayName = deck.profiles?.username || deck.profiles?.full_name;
                return (
                  <DeckCardItemShared key={deck.id} deck={deck} creatorUsername={creatorDisplayName} onDelete={handleDeckDelete} />
                )
              })}
            </div>
          ) : (
             <p className="text-neutral-500 mt-2">Quando guardar decks de outros criadores, eles aparecerão aqui.</p>
          )}
        </div>
      </div>
    </div>
  )
}