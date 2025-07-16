'use client'

import { useActionState, useState, useEffect, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutocompleteInput from '@/app/(site)/components/deck/AutocompleteInput';
import { buildUserDeckWithAI, saveUserDeck } from '@/app/actions/userDeckActions';
import type { ScryfallCard } from '@/app/lib/types';
import { Loader2, Sparkles, X, Wand2, Save, RefreshCw } from 'lucide-react';

// Tipos
interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface BuildDeckState {
  deck?: { name: string; description: string; decklist: Decklist };
  error?: string;
  success: boolean;
  generation_log_id?: string;
}
const initialState: BuildDeckState = { success: false };

// Componente para exibir o decklist
function DecklistDisplay({ decklist, commander }: { decklist: Decklist; commander?: ScryfallCard | null }) {
  return (
    <pre className="text-sm bg-neutral-800 p-4 rounded-md max-h-96 overflow-auto whitespace-pre-wrap font-mono">
      {commander && `Comandante\n1 ${commander.name}\n\n`}
      {decklist.mainboard.map(c => `${c.count} ${c.name}`).join('\n')}
      {decklist.sideboard && decklist.sideboard.length > 0 && `\n\nSideboard\n${decklist.sideboard.map(c => `${c.count} ${c.name}`).join('\n')}`}
    </pre>
  );
}

// Botão para gerar o deck
function BuildButton({ isDisabled }: { isDisabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" type="submit" className="w-full" disabled={pending || isDisabled}>
      {pending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Construindo...</> : <><Sparkles className="mr-2 h-5 w-5" /> Construir com IA</>}
    </Button>
  );
}

// Botão para salvar o deck
function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="bg-green-600 hover:bg-green-700">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar na Minha Conta</>}
    </Button>
  );
}

// Componente principal da página
export default function DeckBuildPage() {
  const [state, formAction] = useActionState(buildUserDeckWithAI, initialState);
  const [format, setFormat] = useState('');
  const [commander, setCommander] = useState<ScryfallCard | null>(null);
  const [userPrompt, setUserPrompt] = useState('');
  const [showForm, setShowForm] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error, { description: 'Tente ajustar sua instrução ou gerar novamente.' });
      setShowForm(true);
    } else if (state?.success && state.deck) {
      toast.success("Deck gerado com sucesso!");
      setShowForm(false);
    }
  }, [state]);

  const totalGeneratedCards = useMemo(() => {
    return (
      (state.deck?.decklist?.mainboard.reduce((s, c) => s + c.count, 0) || 0) +
      (state.deck?.decklist?.sideboard?.reduce((s, c) => s + c.count, 0) || 0)
    );
  }, [state.deck]);

  const isBuildDisabled = !format || (format !== 'commander' && !userPrompt.trim()) || (format === 'commander' && !commander && !userPrompt.trim());

  // Função para resetar o formulário
  const handleTryAgain = () => {
    setShowForm(true);
    setResetKey(prev => prev + 1);
  };

  // Se a geração foi um sucesso, mostra a tela de resultados
  if (state.success && state.deck && !showForm) {
    return (
      <div className="container mx-auto max-w-4xl py-8 animate-in fade-in">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 mt-4 mb-2">{state.deck.name}</h1>
          <p className="text-lg text-neutral-300">{state.deck.description}</p>
        </header>
        <div className="space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Decklist Gerada ({totalGeneratedCards} cartas)</CardTitle></CardHeader>
            <CardContent>
              <DecklistDisplay decklist={state.deck.decklist} commander={commander} />
            </CardContent>
          </Card>
          <form action={async (formData) => { await saveUserDeck(formData); }} className="flex flex-col sm:flex-row gap-4 pt-4">
            <input type="hidden" name="name" value={state.deck.name} />
            <input type="hidden" name="format" value={format} />
            <input type="hidden" name="description" value={state.deck.description} />
            <input type="hidden" name="decklist" value={JSON.stringify(state.deck.decklist)} />
            <input type="hidden" name="commanderName" value={commander?.name || ''} />
            <SaveButton />
            <Button variant="outline" type="button" size="lg" onClick={handleTryAgain}>Gerar Outro Deck</Button>
          </form>
        </div>
      </div>
    );
  }

  // Mostra o formulário inicial de geração
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <Wand2 className="h-12 w-12 mx-auto text-amber-400" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400 mt-4 mb-2">Construtor de Decks</h1>
          <p className="text-lg text-neutral-300">Dê uma ideia, escolha o formato e deixe a IA fazer o trabalho pesado.</p>
        </header>

        <form action={formAction} key={resetKey}>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle>1. Defina sua Ideia</CardTitle>
              <CardDescription>Escolha o formato e dê uma direção para a IA.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="format">Formato</Label>
                <Select name="format" required onValueChange={(value) => {setFormat(value); setCommander(null);}} value={format}>
                  <SelectTrigger className="bg-neutral-800"><SelectValue placeholder="Selecione um formato..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commander">Commander</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="pioneer">Pioneer</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="pauper">Pauper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {format === 'commander' && (
                <div className="space-y-2 animate-in fade-in">
                  <Label>Comandante (Opcional)</Label>
                  {!commander ? (
                    <AutocompleteInput onSelect={(card) => setCommander(card)} placeholder="Digite o nome de um comandante..."/>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-neutral-800/50 border border-neutral-700 rounded-md">
                      <p className="font-semibold text-amber-400">{commander.name}</p>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-neutral-400 hover:text-white" onClick={() => setCommander(null)} aria-label="Remover comandante">
                        <X size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="user_prompt">Instruções para a IA</Label>
                <Textarea id="user_prompt" name="user_prompt" placeholder="Ex: Um deck tribal de goblins, muito rápido e agressivo." rows={3} className="bg-neutral-800 border-neutral-700" value={userPrompt} onChange={e => setUserPrompt(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 pt-6">
              <p className="text-xs text-neutral-500">Para melhores resultados, forneça uma instrução clara. Para Commander, você pode escolher um comandante ou deixar a IA escolher com base nas suas instruções.</p>
              <BuildButton isDisabled={isBuildDisabled} />
            </CardFooter>
          </Card>

          {commander && (
            <>
              <input type="hidden" name="commanderName" value={commander.name} />
              <input type="hidden" name="commanderColorIdentity" value={JSON.stringify(commander.color_identity)} />
            </>
          )}
        </form>
        {state.error && !state.success && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-md mt-4 text-center">
            {state.error}
            <Button variant="outline" size="sm" className="mt-2" onClick={handleTryAgain}>
              <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}