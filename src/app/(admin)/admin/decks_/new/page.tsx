/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client'

import { useState, useMemo, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { createSiteDeck } from '@/app/actions/admin/deckAdminActions';
import type { ScryfallCard } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AutocompleteInput from '@/app/(site)/components/deck/AutocompleteInput';
import DecklistEditor from '../components/DecklistEditor';
import { Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button size="lg" type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-600" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando Deck...</> : <><Save className="mr-2 h-4 w-4" /> Criar e Salvar Deck</>}
    </Button>
  );
}

const initialState = { message: '', success: false };

export default function CreateSiteDeckPage() {
  // Replace useActionState with useState for local state management
  const [state, setState] = useState(initialState);
  const [name, setName] = useState('');
  const [format, setFormat] = useState('');
  const [description, setDescription] = useState('');
  const [commander, setCommander] = useState<ScryfallCard | null>(null);
  const [mainboard, setMainboard] = useState<{name: string, count: number}[]>([]);
  const [sideboard, setSideboard] = useState<{name: string, count: number}[]>([]);
  const [cardDataMap, setCardDataMap] = useState<Map<string, ScryfallCard>>(new Map());
  const [pastedText, setPastedText] = useState('');

  useEffect(() => {
    if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  const addCard = (card: ScryfallCard, to: 'mainboard' | 'sideboard') => {
    const list = to === 'mainboard' ? mainboard : sideboard;
    const setList = to === 'mainboard' ? setMainboard : setSideboard;
    setCardDataMap(prev => new Map(prev).set(card.name, card));
    const existing = list.find(c => c.name === card.name);
    if (existing) {
      setList(prev => prev.map(c => c.name === card.name ? { ...c, count: c.count + 1 } : c));
    } else {
      setList(prev => [...prev, { name: card.name, count: 1 }]);
    }
  };

  const handleQuantityChange = (cardName: string, newCount: number, from: 'mainboard' | 'sideboard') => {
    const setList = from === 'mainboard' ? setMainboard : setSideboard;
    if (newCount <= 0) {
      setList(prev => prev.filter(c => c.name !== cardName));
    } else {
      setList(prev => prev.map(c => c.name === cardName ? { ...c, count: newCount } : c));
    }
  };
  
  const removeCard = (cardName: string, from: 'mainboard' | 'sideboard') => {
    handleQuantityChange(cardName, 0, from);
  };

  const decklistForAction = useMemo(() => ({ mainboard, sideboard }), [mainboard, sideboard]);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-amber-500">Criar Novo Deck do Site</h1>
        <p className="text-neutral-400 mt-1">Crie decks para serem exibidos como conteúdo da plataforma.</p>
      </header>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const result = await createSiteDeck(state, formData);
          setState(result);
        }}
      >
        <input type="hidden" name="decklist" value={JSON.stringify(decklistForAction)} />
        <input type="hidden" name="commanderName" value={commander?.name || ''} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader><CardTitle>Informações do Deck</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-1"><Label htmlFor="name">Nome do Deck</Label><Input id="name" name="name" required value={name} onChange={e => setName(e.target.value)} /></div>
                   <div className="space-y-1"><Label htmlFor="format">Formato</Label><Select name="format" required onValueChange={setFormat} value={format}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent><SelectItem value="commander">Commander</SelectItem><SelectItem value="standard">Standard</SelectItem><SelectItem value="pioneer">Pioneer</SelectItem><SelectItem value="modern">Modern</SelectItem><SelectItem value="pauper">Pauper</SelectItem></SelectContent></Select></div>
                   {format === 'commander' && (<div className="space-y-1"><Label>Comandante</Label><AutocompleteInput onSelect={setCommander} placeholder="Buscar comandante..." /></div>)}
                  <div className="space-y-1"><Label htmlFor="description">Descrição</Label><Textarea id="description" name="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Estratégia, tema, etc." /></div>
              </CardContent>
            </Card>

            <Tabs defaultValue="mainboard">
                <TabsList><TabsTrigger value="mainboard">Deck Principal</TabsTrigger><TabsTrigger value="sideboard">Sideboard</TabsTrigger></TabsList>
                <TabsContent value="mainboard"><DecklistEditor title="Deck Principal" cards={mainboard.map(c => ({ count: c.count, card: cardDataMap.get(c.name)! })).filter(c => c.card)} onQuantityChange={(name, count) => handleQuantityChange(name, count, 'mainboard')} onRemoveCard={(name) => removeCard(name, 'mainboard')} /></TabsContent>
                <TabsContent value="sideboard"><DecklistEditor title="Sideboard" cards={sideboard.map(c => ({ count: c.count, card: cardDataMap.get(c.name)! })).filter(c => c.card)} onQuantityChange={(name, count) => handleQuantityChange(name, count, 'sideboard')} onRemoveCard={(name) => removeCard(name, 'sideboard')} /></TabsContent>
            </Tabs>
          </div>
          
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
             <Card className="bg-neutral-900 border-neutral-800"><CardHeader><CardTitle>Adicionar Cartas</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-1"><Label>Adicionar ao Deck</Label><AutocompleteInput onSelect={(card) => addCard(card, 'mainboard')} /></div><div className="space-y-1"><Label>Adicionar ao Sideboard</Label><AutocompleteInput onSelect={(card) => addCard(card, 'sideboard')} /></div></CardContent></Card>
            <SubmitButton />
          </aside>
        </div>
      </form>
    </div>
  );
}