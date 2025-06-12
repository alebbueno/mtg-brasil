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
import DeckCardItem from './DeckCardItem' 

// Tipagem para os dados de um deck criado pelo utilizador
type OwnDeck = {
  id: string;
  name: string;
  format: string;
  representative_card_image_url: string | null;
  created_at: string;
}

// ✨ NOVO: Tipagem para um deck guardado, que inclui o perfil do criador ✨
type SavedDeck = OwnDeck & {
  profiles: {
    username: string | null;
  } | null;
}

export default function MyDecksPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [myDecks, setMyDecks] = useState<OwnDeck[]>([])
  const [savedDecks, setSavedDecks] = useState<SavedDeck[]>([]) // ✨ Novo estado para decks guardados
  const [loading, setLoading] = useState(true)

  // Função para buscar os decks criados pelo utilizador
  const fetchMyDecks = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('decks')
      .select('id, name, format, representative_card_image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) console.error('Erro ao buscar meus decks:', error)
    else setMyDecks(data || [])
  }, [supabase]);

  // ✨ NOVA FUNÇÃO: Busca os decks que o utilizador guardou ✨
  const fetchSavedDecks = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_decks')
      .select('decks(*, profiles(username))') // Busca os dados do deck e o username do criador
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar decks guardados:', error)
      } else {
        // O Supabase retorna os dados aninhados, precisamos de os extrair
        const formattedData = data?.map(item => item.decks).filter(Boolean) as unknown as SavedDeck[]
        setSavedDecks(formattedData || [])
      }
  }, [supabase]);


  const handleDeckDelete = useCallback((deckId: string) => {
    setMyDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    // Remove também da lista de guardados se estiver lá
    setSavedDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
  }, []);

  // Efeito para buscar todos os dados iniciais
  useEffect(() => {
    const initialize = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Busca ambos os tipos de decks em paralelo
        await Promise.all([
          fetchMyDecks(user.id),
          fetchSavedDecks(user.id)
        ]);
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    initialize()
  }, [supabase, router, fetchMyDecks, fetchSavedDecks])

  
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
            <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 mb-2">
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
        {myDecks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myDecks.map((deck) => (
              <DeckCardItem key={deck.id} deck={deck} onDelete={handleDeckDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-6 border-2 border-dashed border-neutral-700 rounded-lg">
            <Swords className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-300">Nenhum deck criado</h2>
            <p className="text-neutral-500 mt-1">Comece a sua coleção clicando em &quot;Criar Novo Deck&quot;.</p>
          </div>
        )}
        
        {/* ✨ NOVA SECÇÃO: Decks Guardados ✨ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-amber-400 mb-6 border-b border-neutral-700 pb-2 flex items-center gap-2">
            <Bookmark /> Decks Guardados
          </h2>
          {savedDecks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedDecks.map((deck) => (
                // Passa o nome do criador para o componente do card
                <DeckCardItem key={deck.id} deck={deck} creatorUsername={deck.profiles?.username} onDelete={handleDeckDelete} />
              ))}
            </div>
          ) : (
             <p className="text-neutral-500">Quando guardar decks de outros criadores, eles aparecerão aqui.</p>
          )}
        </div>
      </div>
    </div>
  )
}
