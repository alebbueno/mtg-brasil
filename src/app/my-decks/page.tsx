/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/my-decks/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Loader2, PlusCircle, Swords, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeckCardItem from './componentes/DeckCardItem' 
import DeckCardItemShared from './componentes/DeckCardItemShared' 

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
    full_name: string | null; // Adicionado
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
      // ✨ CORREÇÃO: Adiciona 'color_identity' à busca ✨
      .select('id, name, format, representative_card_image_url, created_at, view_count, save_count, color_identity')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar meus decks:', error.message)
    } else {
      setMyDecks(data || [])
    }
  }, [supabase]);

  // ✨ FUNÇÃO ATUALIZADA: Agora busca em etapas para maior robustez ✨
  const fetchSavedDecks = useCallback(async (userId: string) => {
    try {
      // 1. Obtém os IDs de todos os decks que o utilizador guardou
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

      // 2. Busca os detalhes desses decks, incluindo o user_id do criador
      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        // ✨ CORREÇÃO: Adiciona 'color_identity' à busca ✨
        .select(`id, name, format, representative_card_image_url, created_at, view_count, save_count, color_identity, user_id, profiles(username, full_name)`)
        .in('id', savedDeckIds);
        
      if (decksError) throw new Error(`Falha ao buscar detalhes dos decks: ${decksError.message}`);
      if (!decksData) {
        setSavedDecks([]);
        return;
      }

      // 3. Extrai os IDs dos criadores e busca os seus perfis
      const creatorIds = [...new Set(decksData.map(d => d.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', creatorIds);

      if (profilesError) throw new Error(`Falha ao buscar perfis dos criadores: ${profilesError.message}`);
      
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));

      // 4. Combina os dados dos decks com os perfis dos criadores
      const finalSavedDecks = decksData.map(deck => ({
        ...deck,
        profiles: profilesMap.get(deck.user_id) || null
      }));

      // Ordena os decks pela data de criação
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
            <Button className="mt-4 sm:mt-0 bg-amber-500 text-black hover:bg-amber-600">
              <PlusCircle className="mr-2 h-5 w-5" />
              Criar Novo Deck
            </Button>
          </Link>
        </header>

        {/* Secção para decks criados pelo utilizador */}
        <h2 className="text-3xl font-bold text-amber-500 mb-6 border-b border-neutral-700 pb-2 flex items-center gap-2">
          <Swords /> Decks Criados por Si
        </h2>
        {myDecks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myDecks.map((deck) => (
              <DeckCardItem key={deck.id} deck={deck} onDelete={handleDeckDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 border-2 border-dashed border-neutral-700 rounded-lg">
            <p className="text-neutral-500 mt-1">Quando criar um deck, ele aparecerá aqui.</p>
          </div>
        )}
        
        {/* NOVA SECÇÃO: Decks Guardados */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-amber-500 mb-6 border-b border-neutral-700 pb-2 flex items-center gap-2">
            <Bookmark /> Decks Guardados 
          </h2>
          {savedDecks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedDecks.map((deck) => {
                // ✨ LÓGICA DE EXIBIÇÃO APLICADA AQUI ✨
                const creatorDisplayName = deck.profiles?.username || deck.profiles?.full_name;
                return (
                  <DeckCardItemShared key={deck.id} deck={deck} creatorUsername={creatorDisplayName} onDelete={handleDeckDelete} />
                )
              })}
            </div>
          ) : (
             <p className="text-neutral-500">Quando guardar decks de outros criadores, eles aparecerão aqui.</p>
          )}
        </div>
      </div>
    </div>
  )
}

