/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface TranslationResult {
  translatedText?: string;
  error?: string;
}

/**
 * Traduz o texto da carta com sistema de cache no Supabase para evitar consumo excessivo de IA.
 */
export async function translateCardText(
  cardId: string, 
  cardName: string,
  cardText: string
): Promise<TranslationResult> {
  if (!cardId || !cardText) return { error: 'Dados insuficientes para tradução.' };

  const supabase = createClient();
  
  try {
    // 1. VALIDAÇÃO DE CACHE: Verifica se a tradução já existe no banco
    const { data: cached, error: fetchError } = await supabase
      .from('card_translations')
      .select('translated_text')
      .eq('card_scryfall_id', cardId)
      .maybeSingle(); // Usamos maybeSingle para não disparar erro se não encontrar nada

    if (cached?.translated_text) {
      console.log(`[Cache] Usando tradução existente para: ${cardName}`);
      return { translatedText: cached.translated_text };
    }

    // 2. CONSUMO DE IA: Se chegou aqui, é porque não está no banco
    console.log(`[IA] Gerando nova tradução para: ${cardName}`);
    
    const prompt = `Traduza o texto da carta de Magic "${cardName}" para Português do Brasil. 
    Mantenha termos técnicos (ex: Flying, Trample, Scry, Haste, Deathtouch, Lifelink, Ward) em inglês. 
    Retorne APENAS o texto traduzido, mantendo a formatação original.

    Texto original:
    ${cardText}`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const translated = completion.choices[0]?.message?.content?.trim();

    if (!translated) {
      return { error: "A IA retornou um texto vazio." };
    }

    // 3. SALVAR NO BANCO: Registra a nova tradução para consultas futuras
    const { error: insertError } = await supabase
      .from('card_translations')
      .insert({ 
        card_scryfall_id: cardId, 
        translated_text: translated 
      });

    if (insertError) {
      console.error("[Database Error] Erro ao salvar cache:", insertError.message);
      // Mesmo com erro ao salvar, retornamos a tradução para o usuário desta vez
    }

    return { translatedText: translated };

  } catch (error: any) {
    console.error("[AI Action Error]:", error.message);
    return { error: "Falha na comunicação com o serviço de tradução." };
  }
}