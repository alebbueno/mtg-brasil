/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Loader2, PlusCircle, Swords } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DeckCardItem from './DeckCardItem' // Importa o novo componente

// Tipagem para os dados de um deck
type Deck = {
  id: string
  name: string
  format: string
  representative_card_image_url: string | null
  created_at: string
}

export default function MyDecksPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  // Função para buscar os decks, agora num useCallback para ser reutilizável
  const fetchDecks = useCallback(async (userId: string) => {
    const { data: decksData, error } = await supabase
      .from('decks')
      .select('id, name, format, representative_card_image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar decks:', error)
    } else {
      setDecks(decksData || [])
    }
  }, [supabase]);

  // Função para lidar com a exclusão de um deck no estado local
  const handleDeckDelete = useCallback((deckId: string) => {
    setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
  }, []);

  // Efeito para buscar os dados iniciais
  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchDecks(user.id)
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    initialize()
  }, [supabase, router, fetchDecks])

  // Efeito para ouvir atualizações em tempo real (exclusão de decks)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('realtime-decks')
      .on(
        'postgres_changes',
        {
          event: '*', // O.med Ouve inserções, atualizações e exclusões
          schema: 'public',
          table: 'decks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Alteração recebida nos decks, atualizando a lista...', payload);
          // Busca a lista de decks novamente para refletir a alteração
          fetchDecks(user.id);
        }
      )
      .subscribe()

    // Limpa a subscrição quando o componente é desmontado
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user, fetchDecks])

  if ( loading) {
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

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCardItem key={deck.id} deck={deck} onDelete={handleDeckDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-6 border-2 border-dashed border-neutral-700 rounded-lg">
            <div className="flex justify-center mb-4">
              <Swords className="h-16 w-16 text-neutral-600" />
            </div>
            <h2 className="text-2xl font-semibold text-neutral-300">Nenhum deck encontrado</h2>
            <p className="text-neutral-500 mt-2">
              Parece que ainda não criou nenhum deck. Comece a sua coleção agora!
            </p>
            <div className="mt-6">
              <Link href="/my-deck/create" passHref>
                <Button className="bg-amber-500 text-black hover:bg-amber-600">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Criar o seu primeiro Deck
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}