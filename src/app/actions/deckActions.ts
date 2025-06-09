/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/actions/deckActions.ts
'use server'

import { createClient } from '@/app/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { fetchCardByName, ScryfallCard } from '@/app/lib/scryfall'

export async function updateDeckPrivacy(deckId: string, isPublic: boolean) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Utilizador não autenticado.')
  }

  const { error } = await supabase
    .from('decks')
    .update({ is_public: isPublic })
    .eq('id', deckId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao atualizar privacidade do deck:', error)
    throw new Error('Não foi possível alterar a privacidade do deck.')
  }

  revalidatePath(`/my-deck/[format]/[id]`, 'page')
  revalidatePath('/my-decks')
}

// --- FUNÇÃO DE CRIAR DECK ATUALIZADA ---

interface FormState {
  message: string;
}

export async function createDeck(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient()

  // 1. Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: "Erro: Apenas utilizadores autenticados podem criar decks." }
  }

  // 2. Extrair e validar dados do formulário
  const name = formData.get('name') as string
  const format = formData.get('format') as string
  const description = formData.get('description') as string
  const decklistText = formData.get('decklist') as string
  // Obtém o estado do interruptor. Um switch/checkbox envia 'on' quando está marcado.
  const isPublic = formData.get('is_public') === 'on'; 

  if (!name || name.trim().length < 3) {
    return { message: "Erro: O nome do deck deve ter pelo menos 3 caracteres." }
  }
  if (!format) {
    return { message: "Erro: Por favor, selecione um formato para o deck." }
  }
  if (!decklistText || decklistText.trim() === '') {
    return { message: "Erro: A lista de cartas não pode estar vazia." }
  }

  // 3. Parsear a lista de cartas
  const lines = decklistText.split('\n').filter(line => line.trim() !== '')
  interface DeckCard {
    count: number;
    name: string;
  }
  const decklist = { mainboard: [] as DeckCard[], sideboard: [] as DeckCard[] }
  let currentSection: 'mainboard' | 'sideboard' = 'mainboard'

  for (const line of lines) {
    if (line.toLowerCase().trim() === 'sideboard') {
      currentSection = 'sideboard'
      continue
    }
    const match = line.match(/^(\d+)x?\s+(.+)/i)
    if (match) {
      decklist[currentSection].push({
        count: parseInt(match[1], 10),
        name: match[2].trim(),
      })
    }
  }

  if (decklist.mainboard.length === 0) {
    return { message: "Erro: Não foi possível encontrar cartas no mainboard." }
  }

  // 4. Obter imagem representativa
  let representativeCardImageUrl = null
  const firstCardName = decklist.mainboard.find(card => card.name)?.name
  
  if (firstCardName) {
    try {
      const cardData: ScryfallCard = await fetchCardByName(firstCardName, false)
      representativeCardImageUrl = cardData?.image_uris?.art_crop || cardData?.image_uris?.normal
    } catch (e) {
      console.warn(`Não foi possível buscar a carta representativa: ${firstCardName}`)
    }
  }

  // 5. Inserir na base de dados, incluindo o novo campo 'is_public'
  const { data: newDeck, error } = await supabase
    .from('decks')
    .insert({
      user_id: user.id,
      name,
      format,
      description,
      decklist,
      representative_card_image_url: representativeCardImageUrl,
      is_public: isPublic, // Adiciona o estado de privacidade
    })
    .select('id, format')
    .single()

  if (error) {
    console.error("Erro ao criar deck no Supabase:", error)
    return { message: "Erro na base de dados: não foi possível guardar o deck." }
  }

  // 6. Revalidar cache e redirecionar
  revalidatePath('/my-decks')
  redirect(`/my-deck/${newDeck.format}/${newDeck.id}`)
}
