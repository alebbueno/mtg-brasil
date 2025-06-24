/* eslint-disable no-undef */
'use client'

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutocompleteInput from '@/app/(site)/components/deck/AutocompleteInput';
import { buildDeckWithAI, saveGeneratedDeck } from '@/app/actions/deckBuilderActions';
import type { ScryfallCard } from '@/app/lib/types'; 
import { Loader2, Sparkles, X, Wand2, Save } from 'lucide-react';
// import Link from 'next/link';

interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface BuildDeckState {
  deck?: { name: string; description: string; decklist: Decklist };
  error?: string;
  success: boolean;
  generation_log_id?: string; // Propriedade para o ID do log
}
const initialState: BuildDeckState = { success: false };

function BuildSubmitButton({ format, commanderName, hasCards, hasPrompt }: { 
  format: string; 
  commanderName: string;
  hasCards: boolean;
  hasPrompt: boolean;
}) {
  const { pending } = useFormStatus();
  
  let isDisabled = pending || !format;
  if (!isDisabled) {
    if (format === 'commander' && !commanderName) {
      isDisabled = true;
    } else if (!hasCards && !hasPrompt) {
      isDisabled = true;
    }
  }

  return (
    <Button size="lg" type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isDisabled}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Construindo...</> : <><Sparkles className="mr-2 h-4 w-4" /> Completar com IA</>}
    </Button>
  );
}

function SaveSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending} className="bg-green-600 hover:bg-green-700">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Deck</>}
        </Button>
    )
}

export default function AiDeckBuilderPage() {
  const [state, formAction] = useActionState(buildDeckWithAI, initialState);
  
  const [format, setFormat] = useState('');
  const [cards, setCards] = useState<CoreCard[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [commander, setCommander] = useState<ScryfallCard | null>(null);
  const [userPrompt, setUserPrompt] = useState('');

  useEffect(() => {
    if(!state.success && state.error) {
        toast.error(`Erro da IA: ${state.error}`);
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
  const totalGeneratedCards = (state.deck?.decklist?.mainboard.reduce((s, c) => s + c.count, 0) || 0) + (state.deck?.decklist?.sideboard?.reduce((s, c) => s + c.count, 0) || 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-10 text-center">
            <Wand2 className="h-12 w-12 mx-auto text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 mt-4 mb-2">Construtor de Decks com IA</h1>
            <p className="text-lg text-neutral-300">Dê uma ideia, um comandante ou algumas cartas e deixe a nossa IA construir o deck completo para você.</p>
        </header>

        {state.success && state.deck ? (
            <Card className="bg-neutral-900 border-primary/20 animate-in fade-in">
                <CardHeader>
                    <CardTitle className="text-2xl text-amber-400">{state.deck.name}</CardTitle>
                    <CardDescription>{state.deck.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Decklist Gerada ({totalGeneratedCards} cartas):</h3>
                        <pre className="text-sm bg-neutral-800 p-4 rounded-md max-h-80 overflow-auto whitespace-pre-wrap font-mono">
                            {state.deck.decklist.mainboard.map(c => `${c.count} ${c.name}`).join('\n')}
                            {state.deck.decklist.sideboard && state.deck.decklist.sideboard.length > 0 && `\n\nSideboard\n${state.deck.decklist.sideboard.map(c => `${c.count} ${c.name}`).join('\n')}`}
                        </pre>
                    </div>
                    <form action={saveGeneratedDeck} className="flex flex-col sm:flex-row gap-4 pt-4">
                        <input type="hidden" name="name" value={state.deck.name} />
                        <input type="hidden" name="format" value={format} />
                        <input type="hidden" name="description" value={state.deck.description} />
                        <input type="hidden" name="decklist" value={JSON.stringify(state.deck.decklist)} />
                        {commander && <input type="hidden" name="commander" value={commander.name} />}
                        {state.generation_log_id && (
                          <input type="hidden" name="generation_log_id" value={state.generation_log_id} />
                        )}
                        <SaveSubmitButton />
                        <Button variant="outline" type="button" size="lg" onClick={() => window.location.reload()}>Começar de Novo</Button>
                    </form>
                </CardContent>
            </Card>
        ) : (
            <form action={formAction} className="space-y-8">
                <input type="hidden" name="cards" value={JSON.stringify(cards)} />
                <input type="hidden" name="commander" value={commander?.name || ''} />
                <input type="hidden" name="user_prompt" value={userPrompt} />
                
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>1. Defina as Bases do Deck</CardTitle><CardDescription>Escolha o formato e dê uma direção para a IA.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="format">Formato</Label>
                            <Select name="format" required onValueChange={setFormat} value={format}>
                                <SelectTrigger><SelectValue placeholder="Selecione um formato..." /></SelectTrigger>
                                <SelectContent><SelectItem value="commander">Commander</SelectItem><SelectItem value="standard">Standard</SelectItem><SelectItem value="pioneer">Pioneer</SelectItem><SelectItem value="modern">Modern</SelectItem><SelectItem value="pauper">Pauper</SelectItem></SelectContent>
                            </Select>
                        </div>
                        {format === 'commander' && (
                            <div className="space-y-2">
                                <Label>Comandante</Label>
                                <AutocompleteInput onSelect={setCommander} placeholder="Digite o nome do comandante..." />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="user_prompt">Instruções para a IA (Opcional se adicionar cartas)</Label>
                            <Textarea id="user_prompt" name="user_prompt" placeholder="Ex: Um deck de anjos tribal, agressivo e de baixo custo." rows={3} className="bg-neutral-800 border-neutral-700" value={userPrompt} onChange={e => setUserPrompt(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>2. Adicione Cartas (Opcional se der instruções)</CardTitle><CardDescription>Inclua cartas que você quer que estejam no deck.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2"><Label>Adicionar Interativamente</Label><AutocompleteInput onSelect={handleAddCard} placeholder="Buscar carta..." /></div>
                         <div className="space-y-2"><Label htmlFor="decklist-paste">Ou Cole uma Lista</Label><Textarea id="decklist-paste" placeholder={"1 Sol Ring\n4 Brainstorm"} value={pastedText} onChange={(e) => setPastedText(e.target.value)} rows={6} /><Button type="button" variant="secondary" size="sm" onClick={handleUpdatePastedText} disabled={!pastedText}>Importar</Button></div>
                         {(commander || cards.length > 0) && <h3 className='font-semibold pt-4 border-t border-neutral-800'>Núcleo do Deck ({commander ? totalCards + 1 : totalCards} cartas)</h3>}
                         {commander && (<p className="font-semibold text-amber-400 text-sm">Comandante: {commander.name}</p>)}
                         {cards.length > 0 && <ul className="space-y-1 text-sm mt-2">{cards.map(card => (<li key={card.name} className="flex justify-between items-center p-1 hover:bg-neutral-800/50 rounded"><span>{card.count}x {card.name}</span><Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCard(card.name)}><X size={14} /></Button></li>))}</ul>}
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader><CardTitle>3. Construir com IA</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-neutral-400 mb-4">Você precisa fornecer um formato e pelo menos uma instrução ou algumas cartas para a IA começar.</p>
                        <BuildSubmitButton format={format} commanderName={commander?.name || ''} hasCards={cards.length > 0} hasPrompt={userPrompt.trim().length > 0} />
                        {state.error && !state.success && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
                    </CardContent>
                </Card>
            </form>
        )}
      </div>
    </div>
  );
}