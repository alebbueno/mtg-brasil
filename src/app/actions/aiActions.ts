/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { checkUserRole } from '@/lib/auth';

// --- Lógica de IA Flexível ---
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializa os clientes das IAs
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

interface TranslationResult {
  translatedText?: string;
  error?: string;
}

/**
 * Traduz o texto de uma carta de Magic usando a API definida no .env,
 * com um sistema de cache no banco de dados.
 */
export async function translateCardText(
  cardId: string, 
  cardName: string,
  cardText: string
): Promise<TranslationResult> {
  if (!cardId || !cardText) {
    return { error: 'Dados da carta insuficientes para tradução.' };
  }

  const supabase = createClient();
  
  // 1. Verifica o cache (sem alterações)
  const { data: cachedTranslation } = await supabase
    .from('card_translations')
    .select('translated_text')
    .eq('card_scryfall_id', cardId)
    .single();

  if (cachedTranslation) {
    return { translatedText: cachedTranslation.translated_text };
  }
  
  // Apenas admins podem gerar novas traduções
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { error: "Apenas administradores podem gerar novas traduções." };
  }

  const prompt = `Traduza o seguinte texto da carta de Magic: The Gathering chamada "${cardName}" para o Português do Brasil. Mantenha os termos de jogo chave em inglês (ex: Deathtouch, Flying, Trample, Haste, Scry, Indestructible, Hexproof). Mantenha a formatação de quebras de linha e símbolos de mana (ex: {T}, {W}, {U}, {B}, {R}, {G}). Retorne APENAS o texto traduzido, sem nenhuma introdução.\n\nTexto Original:\n---\n${cardText}\n---`;
  
  let translatedText: string | undefined | null;

  try {
    // --- ROTEADOR DE IA ---
    // Verifica a variável de ambiente para decidir qual IA usar
    if (process.env.AI_PROVIDER === 'google') {
      console.log("Usando Google Gemini para tradução...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
      const result = await model.generateContent(prompt);
      translatedText = result.response.text();
    } else { // O padrão será OpenAI
      console.log("Usando OpenAI para tradução...");
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });
      translatedText = completion.choices[0]?.message?.content?.trim();
    }

    if (!translatedText) {
      return { error: "A IA não conseguiu gerar uma tradução." };
    }

    // 3. Salva a nova tradução no cache (sem alterações)
    const { error: insertError } = await supabase
      .from('card_translations')
      .insert({ card_scryfall_id: cardId, translated_text: translatedText });
      
    if (insertError) {
      console.error("Erro ao salvar tradução no cache:", insertError);
    }

    return { translatedText };

  } catch (error: any) {
    console.error(`Erro na API de ${process.env.AI_PROVIDER || 'openai'}:`, error);
    return { error: `Ocorreu um erro ao comunicar com a IA (${process.env.AI_PROVIDER}).` };
  }
}