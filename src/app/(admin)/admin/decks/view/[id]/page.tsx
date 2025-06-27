import { createClient } from "@/app/utils/supabase/server";
import { checkUserRole } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpenText, BrainCircuit, MessageSquare } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DecklistVisualizer from "../../edit/[id]/components/DecklistVisualizer"; // Reutilizamos o visualizador
import CopyButton from "./components/CopyButton"; // Nosso novo botão de cópia
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: { id: string; };
}

export default async function ViewSiteDeckPage(props: any) {
    const { params } = props as PageProps;
    const isAdmin = await checkUserRole('admin');
    if (!isAdmin) notFound();

    const supabase = createClient();
    const { data: deck, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', params.id)
        .eq('owner_type', 'site') // Garante que estamos vendo um deck do site
        .single();
    
    if (error || !deck) {
        notFound();
    }

    const deckCheck = deck.deck_check || {};
    const socialPosts = deck.social_posts || {};

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <Link href="/admin/decks" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 mb-4">
                    <ArrowLeft size={16} /> Voltar para a lista
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-amber-500">{deck.name}</h1>
                        <p className="text-neutral-300 mt-1">{deck.description}</p>
                    </div>
                    <Link href={`/admin/decks/edit/${deck.id}`}>
                        <Button>Editar Deck</Button>
                    </Link>
                </div>
            </header>

            <Tabs defaultValue="decklist" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="decklist">Decklist</TabsTrigger>
                    <TabsTrigger value="analysis">Análise e Guia</TabsTrigger>
                    <TabsTrigger value="social">Conteúdo Social</TabsTrigger>
                </TabsList>
                
                {/* Aba de Decklist */}
                <TabsContent value="decklist">
                    <Card className="bg-neutral-900 border-neutral-800 mt-4">
                        <CardHeader><CardTitle>Lista de Cartas</CardTitle></CardHeader>
                        <CardContent><DecklistVisualizer decklist={deck.decklist} /></CardContent>
                    </Card>
                </TabsContent>

                {/* Aba de Análise e Guia */}
                <TabsContent value="analysis">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <Card className="bg-neutral-900 border-neutral-800">
                            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpenText size={20}/> Deck Check</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p><strong>Estilo de Jogo:</strong> {deckCheck.playstyle ?? 'N/A'}</p>
                                <p><strong>Condição de Vitória:</strong> {deckCheck.win_condition ?? 'N/A'}</p>
                                <p><strong>Dificuldade:</strong> {deckCheck.difficulty ?? 'N/A'}</p>
                                <p><strong>Pontos Fortes:</strong> {deckCheck.strengths?.join(', ') ?? 'N/A'}</p>
                                <p><strong>Pontos Fracos:</strong> {deckCheck.weaknesses?.join(', ') ?? 'N/A'}</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-neutral-900 border-neutral-800">
                            <CardHeader><CardTitle className="flex items-center gap-2"><BrainCircuit size={20}/> Guia de Como Jogar</CardTitle></CardHeader>
                            <CardContent className="text-sm prose prose-invert max-w-none prose-p:my-2">
                                <p>{deck.how_to_play_guide ?? 'Guia não gerado.'}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Aba de Conteúdo Social */}
                <TabsContent value="social">
                    <Card className="bg-neutral-900 border-neutral-800 mt-4">
                        <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare size={20}/> Textos para Redes Sociais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(socialPosts).map(([platform, text]) => (
                                <div key={platform}>
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-base capitalize font-semibold">{platform}</Label>
                                        <CopyButton textToCopy={text as string} />
                                    </div>
                                    <p className="text-sm p-4 bg-neutral-950 rounded-md whitespace-pre-wrap border border-neutral-700">{text as string || 'Não gerado.'}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}