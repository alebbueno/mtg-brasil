/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/ai-deck-builder/page.tsx
'use client'

import { useActionState, useState, useEffect } from 'react'; // CORREÇÃO: useActionState vem de 'react'
import { useFormStatus } from 'react-dom';                    // CORREÇÃO: useFormStatus vem de 'react-dom'
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutocompleteInput from '@/app/components/deck/AutocompleteInput';
import { buildDeckWithAI, saveGeneratedDeck } from '@/app/actions/deckBuilderActions';
import type { ScryfallCard } from '@/app/lib/scryfall';
import { Loader2, Sparkles, X, Wand2, Save } from 'lucide-react';
import Link from 'next/link';

// Tipos locais
interface CoreCard { name: string; count: number; }
interface BuildDeckState {
  deck?: { name: string; description: string; decklist: { mainboard: CoreCard[], sideboard: CoreCard[] } };
  error?: string;
  success: boolean;
}
const initialState: BuildDeckState = { success: false };

function BuildSubmitButton({ cardCount, format, commanderName }: { cardCount: number, format: string, commanderName: string }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || cardCount < 10;
  return (
    <Button size="lg" type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isDisabled}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A construir...</> : <><Sparkles className="mr-2 h-4 w-4" /> Analisar e Completar</>}
    </Button>
  );
}

function SaveSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A guardar...</> : <><Save className="mr-2 h-4 w-4" /> Guardar Deck</>}
        </Button>
    )
}

export default function AiDeckBuilderPage() {
  const [state, formAction] = useActionState(buildDeckWithAI, initialState);
  
  const [format, setFormat] = useState('');
  const [cards, setCards] = useState<CoreCard[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [commander, setCommander] = useState<ScryfallCard | null>(null);


  useEffect(() => {
    if(!state.success && state.error) {
        toast.error(state.error);
    }
  }, [state]);

  const handleAddCard = (card: ScryfallCard | null) => {
    if (!card) return;
    setCards(prev => {
      const existing = prev.find(c => c.name === card.name);
      if (existing) {
        return prev.map(c => c.name === card.name ? { ...c, count: c.count + 1 } : c);
      }
      return [...prev, { name: card.name, count: 1 }];
    });
  };

  const handleUpdatePastedText = () => {
    const lines = pastedText.split('\n').filter(line => line.trim() !== '');
    const newCards: CoreCard[] = lines.map(line => {
      const match = line.match(/^(\d+)x?\s+(.+)/i);
      return match ? { count: parseInt(match[1], 10), name: match[2].trim() } : null;
    }).filter((c): c is CoreCard => c !== null);
    setCards(newCards);
    toast.success("Lista de cartas importada do texto!");
  };
  
  const removeCard = (name: string) => {
    setCards(prev => prev.filter(c => c.name !== name));
  };
  
  const totalCards = cards.reduce((sum, card) => sum + card.count, 0);
  const totalGeneratedCards = state.deck?.decklist?.mainboard.reduce((s, c) => s + c.count, 0) || 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2 flex items-center justify-center gap-3">
            <Wand2 /> Construtor de Decks com IA
          </h1>
          <p className="text-lg text-neutral-300">
            Forneça um núcleo de cartas e deixe a nossa IA construir o deck completo para si.
          </p>
        </header>

        {state.success && state.deck ? (
            <Card className="bg-neutral-900 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-amber-400">{state.deck.name}</CardTitle>
                    <p className="text-sm text-neutral-400">{state.deck.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Decklist Gerada ({totalGeneratedCards} cartas):</h3>
                        <pre className="text-sm bg-neutral-800 p-2 rounded-md max-h-60 overflow-auto">
                            {state.deck.decklist.mainboard.map(c => `${c.count} ${c.name}`).join('\n')}
                            {state.deck.decklist.sideboard && state.deck.decklist.sideboard.length > 0 && `\n\nSideboard\n${state.deck.decklist.sideboard.map(c => `${c.count} ${c.name}`).join('\n')}`}
                        </pre>
                    </div>
                    <form action={saveGeneratedDeck} className="flex gap-4">
                        <input type="hidden" name="name" value={state.deck.name} />
                        <input type="hidden" name="format" value={format} />
                        <input type="hidden" name="description" value={state.deck.description} />
                        <input type="hidden" name="decklist" value={JSON.stringify(state.deck.decklist)} />
                        <SaveSubmitButton />
                        <Button variant="outline" onClick={() => window.location.reload()}>Começar de Novo</Button>
                    </form>
                </CardContent>
            </Card>
        ) : (
            <form action={formAction} className="space-y-8">
                <input type="hidden" name="cards" value={JSON.stringify(cards)} />
                <input type="hidden" name="commander" value={commander?.name || ''} />
                
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>1. Defina as Bases do Deck</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="format">Formato</Label>
                            <Select name="format" required onValueChange={setFormat}>
                                <SelectTrigger><SelectValue placeholder="Selecione um formato..." /></SelectTrigger>
                                <SelectContent><SelectItem value="commander">Commander</SelectItem><SelectItem value="modern">Modern</SelectItem></SelectContent>
                            </Select>
                        </div>
                        {format === 'commander' && (
                            <div className="space-y-1">
                                <Label>Comandante</Label>
                                <AutocompleteInput onSelect={setCommander} placeholder="Digite o nome do comandante..." />
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label>Adicionar Cartas Interativamente</Label>
                            <AutocompleteInput onSelect={handleAddCard} placeholder="Buscar carta..." />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="decklist-paste">Ou Cole a sua Lista de Cartas Base</Label>
                            <Textarea id="decklist-paste" placeholder="1 Sol Ring..." value={pastedText} onChange={(e) => setPastedText(e.target.value)} rows={6} />
                            <Button type="button" variant="secondary" size="sm" onClick={handleUpdatePastedText} disabled={!pastedText}>Importar da Lista</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>2. Núcleo do Deck ({commander ? totalCards + 1 : totalCards} cartas)</CardTitle></CardHeader>
                    <CardContent>
                        {commander && (
                           <p className="font-semibold text-amber-400">Comandante: {commander.name}</p>
                        )}
                        {cards.length > 0 ? (
                            <ul className="space-y-1 text-sm mt-2">
                                {cards.map(card => (
                                    <li key={card.name} className="flex justify-between items-center p-1 hover:bg-neutral-800/50 rounded">
                                        <span>{card.count}x {card.name}</span>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCard(card.name)}><X size={14} /></Button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            !commander && <p className="text-neutral-500 text-center py-4">Adicione cartas para começar.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>3. Construir com IA</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-400 mb-4">A IA irá usar as cartas acima como base. Para Commander, precisa de selecionar um comandante. Para outros formatos, recomenda-se um mínimo de 10 cartas.</p>
                        <BuildSubmitButton cardCount={totalCards} format={format} commanderName={commander?.name || ''} />
                        {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
                    </CardContent>
                </Card>
            </form>
        )}
      </div>
    </div>
  );
}
