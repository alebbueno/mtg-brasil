/* eslint-disable no-undef */
'use client'

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateDeckContentPackage, saveAiGeneratedDeckAndContent } from '@/app/actions/admin/aiContentGeneratorActions';
import { Loader2, Sparkles, Wand2, Save, BookOpenText, MessageSquare, Newspaper } from 'lucide-react';
import AutocompleteInput from '@/app/(site)/components/deck/AutocompleteInput';
import type { ScryfallCard } from '@/app/lib/types';

// Tipagem para o estado do formulário de geração
interface CoreCard { name: string; count: number; }
interface Decklist { mainboard: CoreCard[]; sideboard?: CoreCard[]; commander?: CoreCard[]; }
interface ContentPackage {
  name: string;
  description: string;
  decklist: Decklist;
  deck_check: Record<string, any>;
  how_to_play_guide: string;
  social_posts: Record<string, string>;
}
interface GenerationState {
  contentPackage?: ContentPackage;
  error?: string;
  success: boolean;
  generation_log_id?: string;
}

const initialState: GenerationState = { success: false };

function GenerateButton({ format, commanderName }: { format: string, commanderName: string | null }) {
  const { pending } = useFormStatus();
  const isDisabled = pending || !format || (format === 'commander' && !commanderName);
  return (
    <Button size="lg" type="submit" className="w-full" disabled={isDisabled}>
      {pending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gerando conteúdo, isso pode levar um minuto...</> : <><Sparkles className="mr-2 h-5 w-5" /> Gerar Pacote de Conteúdo</>}
    </Button>
  );
}

function SaveButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="lg" disabled={pending} className="bg-green-600 hover:bg-green-700">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...</> : <><Save className="mr-2 h-4 w-4" /> Publicar Deck e Conteúdo</>}
        </Button>
    )
}

export default function AiContentGeneratorPage() {
  const [state, formAction] = useActionState(generateDeckContentPackage, initialState);
  const [format, setFormat] = useState('');
  const [commander, setCommander] = useState<ScryfallCard | null>(null);

  useEffect(() => {
    if (state.success && state.contentPackage) {
        toast.success("Pacote de conteúdo gerado com sucesso!");
    } else if (state.error) {
        toast.error("Erro da IA:", state.error);
    }
  }, [state]);

  // Se a geração foi um sucesso, mostra a tela de resultados
  if (state.success && state.contentPackage) {
    const { contentPackage } = state;
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
        <header className="mb-2 text-center">
            <h1 className="text-3xl font-bold text-amber-400">{contentPackage.name || 'Nome não gerado'}</h1>
            <p className="text-neutral-300 mt-2">{contentPackage.description || 'Descrição não gerada'}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Decklist</CardTitle></CardHeader>
            <CardContent><pre className="text-sm bg-neutral-950 p-3 rounded-md max-h-96 overflow-auto">{contentPackage.decklist?.mainboard?.map((c:any) => `${c.count} ${c.name}`).join('\n') || 'Lista não gerada.'}</pre></CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpenText size={20}/> Deck Check</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
                <p><strong>Estilo:</strong> {contentPackage.deck_check?.playstyle ?? 'N/A'}</p>
                <p><strong>Vitória:</strong> {contentPackage.deck_check?.win_condition ?? 'N/A'}</p>
                <p><strong>Dificuldade:</strong> {contentPackage.deck_check?.difficulty ?? 'N/A'}</p>
                <p><strong>Pontos Fortes:</strong> {contentPackage.deck_check?.strengths?.join(', ') ?? 'N/A'}</p>
                <p><strong>Pontos Fracos:</strong> {contentPackage.deck_check?.weaknesses?.join(', ') ?? 'N/A'}</p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle className="flex items-center gap-2"><Newspaper size={20}/> Guia de Como Jogar</CardTitle></CardHeader>
            <CardContent className="text-sm p-4 bg-neutral-950 rounded-md whitespace-pre-wrap leading-relaxed">{contentPackage.how_to_play_guide ?? 'Não gerado.'}</CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare size={20}/> Posts para Redes Sociais</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="facebook">
              <TabsList><TabsTrigger value="facebook">Facebook</TabsTrigger><TabsTrigger value="instagram">Instagram</TabsTrigger><TabsTrigger value="x">X (Twitter)</TabsTrigger><TabsTrigger value="reddit">Reddit</TabsTrigger></TabsList>
              <TabsContent value="facebook" className="text-sm p-4 bg-neutral-950 rounded-b-md rounded-r-md whitespace-pre-wrap">{contentPackage.social_posts?.facebook ?? 'Não gerado.'}</TabsContent>
              <TabsContent value="instagram" className="text-sm p-4 bg-neutral-950 rounded-b-md rounded-r-md whitespace-pre-wrap">{contentPackage.social_posts?.instagram ?? 'Não gerado.'}</TabsContent>
              <TabsContent value="x" className="text-sm p-4 bg-neutral-950 rounded-b-md rounded-r-md whitespace-pre-wrap">{contentPackage.social_posts?.x ?? 'Não gerado.'}</TabsContent>
              <TabsContent value="reddit" className="text-sm p-4 bg-neutral-950 rounded-b-md rounded-r-md whitespace-pre-wrap">{contentPackage.social_posts?.reddit ?? 'Não gerado.'}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <form action={saveAiGeneratedDeckAndContent} className="flex justify-end gap-4 pt-4">
            <input type="hidden" name="name" value={contentPackage.name} />
            <input type="hidden" name="format" value={format} />
            <input type="hidden" name="description" value={contentPackage.description} />
            <input type="hidden" name="decklist" value={JSON.stringify(contentPackage.decklist ?? {})} />
            <input type="hidden" name="deck_check" value={JSON.stringify(contentPackage.deck_check ?? {})} />
            <input type="hidden" name="how_to_play_guide" value={contentPackage.how_to_play_guide} />
            <input type="hidden" name="social_posts" value={JSON.stringify(contentPackage.social_posts ?? {})} />
            {commander && <input type="hidden" name="commanderName" value={commander.name} />}
            {state.generation_log_id && <input type="hidden" name="generation_log_id" value={state.generation_log_id} />}
            <Button variant="outline" type="button" size="lg" onClick={() => window.location.reload()}>Gerar Outro</Button>
            <SaveButton />
        </form>
      </div>
    );
  }

  // Senão, mostra o formulário de geração
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 text-center">
          <Wand2 className="h-12 w-12 mx-auto text-amber-400" />
          <h1 className="text-4xl font-extrabold text-amber-400 mt-4 mb-2">Super Gerador de Conteúdo</h1>
          <p className="text-lg text-neutral-300">Gere um deck, análise e posts para redes sociais com um único clique.</p>
      </header>
      <form action={formAction}>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle>Gerar Novo Pacote de Conteúdo</CardTitle>
            <CardDescription>Insira uma ideia ou tema para o deck e selecione o formato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select name="format" required onValueChange={(value) => {setFormat(value); setCommander(null);}} value={format}>
                <SelectTrigger className="bg-neutral-800"><SelectValue placeholder="Selecione um formato..." /></SelectTrigger>
                <SelectContent><SelectItem value="commander">Commander</SelectItem><SelectItem value="pauper">Pauper</SelectItem><SelectItem value="modern">Modern</SelectItem><SelectItem value="standard">Standard</SelectItem></SelectContent>
              </Select>
            </div>
            {format === 'commander' && (
              <div className="space-y-2 animate-in fade-in">
                <Label>Comandante (Obrigatório)</Label>
                <AutocompleteInput onSelect={(card) => setCommander(card)} placeholder="Digite o nome do comandante..." />
                {commander && (<><input type="hidden" name="commanderName" value={commander.name} /><input type="hidden" name="commanderColorIdentity" value={JSON.stringify(commander.color_identity)} /></>)}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user_prompt">Ideia / Tema do Deck</Label>
              <Textarea id="user_prompt" name="user_prompt" required minLength={20} placeholder="Ex: Um deck de Commander com 'Atraxa, Praetors' Voice' focado em Proliferate e marcadores +1/+1, com uma pegada de controle." rows={4} />
            </div>
          </CardContent>
          <CardFooter>
            <GenerateButton format={format} commanderName={commander?.name || null} />
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}