/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/my-decks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, PlusCircle, Swords } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        const { data: decksData, error } = await supabase
          .from('decks')
          .select('id, name, format, representative_card_image_url, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar decks:', error)
        } else {
          setDecks(decksData || [])
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    fetchData()
  }, [supabase, router])

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

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              // --- CORREÇÃO AQUI ---
              // O link agora aponta para a rota correta: /my-deck/[format]/[id]
              <Link href={`/my-deck/${deck.format}/${deck.id}`} key={deck.id}>
                <Card className="bg-neutral-900 border-neutral-800 hover:border-amber-500 transition-all duration-300 group cursor-pointer h-full flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative w-full aspect-[5/3] rounded-t-lg overflow-hidden">
                      <Image
                        src={deck.representative_card_image_url || 'https://placehold.co/400x240/171717/EAB308?text=Deck'}
                        alt={`Carta representativa do deck ${deck.name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <CardTitle className="text-xl text-amber-400 group-hover:text-amber-300 truncate">{deck.name}</CardTitle>
                    <CardDescription className="capitalize text-neutral-400 mt-1">{deck.format}</CardDescription>
                    <div className="flex-grow"></div>
                    <p className="text-xs text-neutral-500 mt-4">
                      Criado em: {new Date(deck.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>
              </Link>
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
