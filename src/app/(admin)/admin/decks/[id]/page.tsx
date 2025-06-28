// src/app/(admin)/admin/ai-generations/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';
import { ArrowLeft, BookOpenText, BrainCircuit, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DecklistVisualizer from './components/DecklistVisualizer';

export default function GenerationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [generation, setGeneration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const supabase = createClient();

    const fetchData = async () => {
      const { data, error } = await supabase
        .from('ai_deck_generations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.replace('/not-found');
        return;
      }

      if (data.was_saved && data.saved_deck_id) {
        const { data: deck, error: deckError } = await supabase
          .from('decks')
          .select('name, description, format, decklist, social_posts, representative_card_image_url, deck_check, color_identity')
          .eq('id', data.saved_deck_id)
          .single();

        if (!deckError) {
          data.saved_deck = deck;
        }
      }

      setGeneration(data);
      setLoading(false);
    };

    fetchData();
  }, [id, router]);

  if (loading) return <p className="text-neutral-400">Carregando...</p>;
  if (!generation) return null;

  const deck = generation.saved_deck || {};
  const deckCheck = deck.deck_check || generation.deck_check || {};
  const socialPosts = deck.social_posts || generation.social_posts || {};
  const decklist = deck.decklist as { mainboard: any[]; sideboard?: any[] } || null;
  const inputCards = generation.input_cards || [];

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <Link
          href="/admin/ai-generations"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Voltar para o histórico
        </Link>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-amber-500">
            {deck.name || generation.generated_deck_name || 'Geração sem nome'}
          </h1>
          {generation.was_saved ? (
            <Link href={`/my-deck/commander/${generation.saved_deck_id}`} target="_blank">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 hover:bg-green-500/30 cursor-pointer">
                <CheckCircle size={14} className="mr-1" /> Salvo
              </Badge>
            </Link>
          ) : (
            <Badge variant="secondary">
              <XCircle size={14} className="mr-1" /> Não Salvo
            </Badge>
          )}
        </div>
        <p className="text-neutral-400 mt-1">
          Gerado por @{generation.username || 'desconhecido'} em{' '}
          {new Date(generation.created_at).toLocaleString('pt-BR')}
        </p>
      </header>

      <Tabs defaultValue="decklist" className="space-y-6">
        <TabsList>
          <TabsTrigger value="decklist">Decklist</TabsTrigger>
          <TabsTrigger value="entrada">Entrada</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
        </TabsList>

        <TabsContent value="decklist">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText size={20} /> Decklist Gerada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DecklistVisualizer decklist={decklist} cardDataMap={undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entrada">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit size={20} /> Informações de Entrada
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                <strong>Formato:</strong>{' '}
                <Badge variant="secondary">{generation.format}</Badge>
              </p>
              <div>
                <strong>Instrução do Admin:</strong>
                <blockquote className="mt-2 pl-4 border-l-2 border-neutral-700 text-neutral-300 italic">
                  {generation.input_prompt || 'N/A'}
                </blockquote>
              </div>
              {inputCards.length > 0 && (
                <div>
                  <strong>Cartas de Base Fornecidas:</strong>
                  <pre className="text-xs bg-neutral-950 p-2 rounded-md mt-2 max-h-40 overflow-y-auto">
                    {inputCards.map((c: any) => `${c.count} ${c.name}`).join('\n')}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analise">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenText size={20} /> Análise do Deck (Deck Check)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Estilo de Jogo:</strong> {deckCheck.playstyle ?? 'N/A'}
              </p>
              <p>
                <strong>Condição de Vitória:</strong> {deckCheck.win_condition ?? 'N/A'}
              </p>
              <p>
                <strong>Dificuldade:</strong> {deckCheck.difficulty ?? 'N/A'}
              </p>
              <p>
                <strong>Pontos Fortes:</strong> {deckCheck.strengths?.join(', ') ?? 'N/A'}
              </p>
              <p>
                <strong>Pontos Fracos:</strong> {deckCheck.weaknesses?.join(', ') ?? 'N/A'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} /> Textos para Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="facebook" className="w-full">
                <TabsList>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="x">X (Twitter)</TabsTrigger>
                  <TabsTrigger value="reddit">Reddit</TabsTrigger>
                </TabsList>
                <TabsContent value="facebook" className="text-sm p-4 bg-neutral-950 rounded-b-md whitespace-pre-wrap">
                  {socialPosts.facebook ?? 'Não gerado.'}
                </TabsContent>
                <TabsContent value="instagram" className="text-sm p-4 bg-neutral-950 rounded-b-md whitespace-pre-wrap">
                  {socialPosts.instagram ?? 'Não gerado.'}
                </TabsContent>
                <TabsContent value="x" className="text-sm p-4 bg-neutral-950 rounded-b-md whitespace-pre-wrap">
                  {socialPosts.x ?? 'Não gerado.'}
                </TabsContent>
                <TabsContent value="reddit" className="text-sm p-4 bg-neutral-950 rounded-b-md whitespace-pre-wrap">
                  {socialPosts.reddit ?? 'Não gerado.'}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
