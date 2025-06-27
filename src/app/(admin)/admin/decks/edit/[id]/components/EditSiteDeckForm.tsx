'use client'

import { useTransition } from 'react';
import { updateSiteDeck } from '@/app/actions/admin/deckAdminActions';
import type { DeckFromDB } from '@/app/lib/types';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// O botão agora recebe o estado de 'pending' como uma prop
function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Salvando...</> : <><Save className="mr-2 h-4 w-4"/> Salvar Alterações</>}
    </Button>
  );
}

export default function EditSiteDeckForm({ deck }: { deck: DeckFromDB }) {
  // Usamos useTransition para controlar o estado de "carregando"
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      // Chamamos a server action diretamente
      const result = await updateSiteDeck(deck.id, null, formData);

      if (result?.success) {
        toast.success(result.message);
      } else if (result?.message) {
        toast.error(result.message);
      }
    });
  };

  return (
    // O formulário agora chama nossa função de cliente 'handleSubmit'
    <form action={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Informações Principais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                  <Label htmlFor="name">Nome do Deck</Label>
                  <Input id="name" name="name" defaultValue={deck.name} />
              </div>
              <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" name="description" defaultValue={deck.description || ''} rows={4} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Conteúdo para Redes Sociais</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="facebook">
                <TabsList>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="x">X (Twitter)</TabsTrigger>
                  <TabsTrigger value="reddit">Reddit</TabsTrigger>
                </TabsList>
                <TabsContent value="facebook"><Textarea name="social_post_facebook" defaultValue={deck.social_posts?.facebook || ''} rows={8} /></TabsContent>
                <TabsContent value="instagram"><Textarea name="social_post_instagram" defaultValue={deck.social_posts?.instagram || ''} rows={8} /></TabsContent>
                <TabsContent value="x"><Textarea name="social_post_x" defaultValue={deck.social_posts?.x || ''} rows={8} /></TabsContent>
                <TabsContent value="reddit"><Textarea name="social_post_reddit" defaultValue={deck.social_posts?.reddit || ''} rows={8} /></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        {/* Coluna Direita */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Análise (Deck Check)</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                <Label>Estilo de Jogo</Label><Input name="deck_check_playstyle" defaultValue={deck.deck_check?.playstyle || ''} />
                <Label>Condição de Vitória</Label><Input name="deck_check_win_condition" defaultValue={deck.deck_check?.win_condition || ''} />
                <Label>Dificuldade</Label><Input name="deck_check_difficulty" defaultValue={deck.deck_check?.difficulty || ''} />
                <Label>Pontos Fortes (separados por vírgula)</Label><Textarea name="deck_check_strengths" defaultValue={deck.deck_check?.strengths?.join(', ') || ''} rows={3}/>
                <Label>Pontos Fracos (separados por vírgula)</Label><Textarea name="deck_check_weaknesses" defaultValue={deck.deck_check?.weaknesses?.join(', ') || ''} rows={3}/>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Guia de Como Jogar</CardTitle></CardHeader>
            <CardContent>
                <Textarea name="how_to_play_guide" defaultValue={deck.how_to_play_guide || ''} rows={10}/>
            </CardContent>
          </Card>
          <SubmitButton isPending={isPending} />
        </div>
      </div>
    </form>
  )
}