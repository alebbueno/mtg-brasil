'use client'

import { useActionState, useState } from 'react'
// AJUSTE: Não vamos mais precisar do useFormStatus aqui
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createDeck } from '@/app/actions/deckActions'
import { Loader2, PlusCircle, Globe, Lock } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import AutocompleteInput from '@/app/components/deck/AutocompleteInput'

const initialState = {
  message: '',
}

// AJUSTE: O botão agora recebe o estado de loading como uma prop
function SubmitButton({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-600" disabled={isSubmitting}>
      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A criar deck...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Criar Deck</>}
    </Button>
  )
}

export default function CreateDeckPage() {
  const [state, formAction] = useActionState(createDeck, initialState)
  
  // AJUSTE: Estado para controlar o clique e o feedback de loading
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isPublic, setIsPublic] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [commander, setCommander] = useState('')
  const [creationMode, setCreationMode] = useState<'list' | 'builder'>('list');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-500">
            Criar Novo Deck
          </h1>
          <p className="text-lg text-neutral-300 mt-2">
            Dê vida às suas novas estratégias.
          </p>
        </header>

        {/* AJUSTE: Adicionado o `onSubmit` para ativar nosso estado de loading manual */}
        <form 
          action={formAction} 
          onSubmit={() => setIsSubmitting(true)}
          className="p-8 bg-neutral-900 rounded-lg border border-neutral-800 space-y-6"
        >
          {/* O `fieldset` agora usa o estado `isSubmitting` */}
          <fieldset 
            disabled={isSubmitting} 
            className="space-y-6 transition-opacity duration-300 [&:disabled]:opacity-50 [&:disabled]:cursor-not-allowed"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-semibold">Nome do Deck</Label>
              <Input id="name" name="name" placeholder="Ex: Mono Black Control" className="bg-neutral-800 border-neutral-700 focus:ring-amber-500" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="format" className="text-lg font-semibold">Formato</Label>
                <Select name="format" onValueChange={setSelectedFormat} value={selectedFormat}>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 focus:ring-amber-500">
                    <SelectValue placeholder="Selecione um formato" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                    <SelectItem value="commander">Commander</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="pauper">Pauper</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="legacy">Legacy</SelectItem>
                    <SelectItem value="vintage">Vintage</SelectItem>
                    <SelectItem value="pioneer">Pioneer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                  <Label className="text-lg font-semibold">Visibilidade</Label>
                  <div className="flex items-center space-x-3 p-3 bg-neutral-800 border border-neutral-700 rounded-md h-full">
                      <Switch id="is_public" name="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
                      <Label htmlFor="is_public" className="flex items-center gap-2 cursor-pointer">
                          {isPublic ? <Globe size={16} className="text-green-400"/> : <Lock size={16} className="text-red-400"/>}
                          <span>{isPublic ? 'Público' : 'Privado'}</span>
                      </Label>
                  </div>
              </div>
            </div>

            {selectedFormat === 'commander' && (
              <div className="space-y-2">
                <Label htmlFor="commander" className="text-lg font-semibold">Comandante</Label>
                <AutocompleteInput onSelect={(card) => card ? setCommander(card.name) : setCommander('')} placeholder="Digite o nome do seu comandante..." />
                <input type="hidden" name="commander" value={commander} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">Descrição (Opcional)</Label>
              <Textarea id="description" name="description" placeholder="Descreva a estratégia principal, combos ou como o deck funciona." rows={4} className="bg-neutral-800 border-neutral-700 focus:ring-amber-500" />
            </div>
            
            <div className="space-y-3">
               <Label className="text-lg font-semibold">Modo de Criação</Label>
               <RadioGroup name="creationMode" value={creationMode} onValueChange={(value: 'list' | 'builder') => setCreationMode(value)}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Label htmlFor="mode-list" className="flex flex-col items-start gap-2 p-4 rounded-lg border border-neutral-700 bg-neutral-800 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-950/50 cursor-pointer">
                           <div className="flex items-center justify-between w-full">
                              <span className="font-semibold text-base">Colar uma Lista</span>
                              <RadioGroupItem value="list" id="mode-list" />
                           </div>
                           <p className="text-sm text-neutral-400">Crie o deck enviando uma lista de cartas já pronta.</p>
                      </Label>
                      <Label htmlFor="mode-builder" className="flex flex-col items-start gap-2 p-4 rounded-lg border border-neutral-700 bg-neutral-800 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-950/50 cursor-pointer">
                           <div className="flex items-center justify-between w-full">
                             <span className="font-semibold text-base">Adicionar Cartas Depois</span>
                             <RadioGroupItem value="builder" id="mode-builder" />
                           </div>
                           <p className="text-sm text-neutral-400">Crie um deck vazio e adicione as cartas na página de edição.</p>
                      </Label>
                  </div>
               </RadioGroup>
            </div>

            {creationMode === 'list' && (
              <div className="space-y-2">
                <Label htmlFor="decklist" className="text-lg font-semibold">
                  Lista de Cartas {selectedFormat === 'commander' && '(as 99, sem o comandante)'}
                </Label>
                <Textarea
                  id="decklist"
                  name="decklist"
                  required={creationMode === 'list'}
                  placeholder={
                    `Cole a sua lista aqui.\nFormato esperado:\n1 Sol Ring\n4 Swords to Plowshares\n\nSideboard\n1 Rest in Peace`
                  }
                  rows={20}
                  className="bg-neutral-800 border-neutral-700 font-mono text-sm focus:ring-amber-500"
                />
              </div>
            )}
          </fieldset>

          {state.message && !isSubmitting && ( // Mostra erro apenas se não estiver submetendo
             <Alert variant="destructive">
               <AlertTitle>Erro</AlertTitle>
               <AlertDescription>{state.message}</AlertDescription>
             </Alert>
          )}

          <SubmitButton isSubmitting={isSubmitting} />
        </form>
      </div>
    </div>
  );
}