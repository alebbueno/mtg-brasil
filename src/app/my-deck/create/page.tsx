// app/my-deck/create/page.tsx
'use client'

import { useActionState } from 'react' // hook para estado da ação
import { useFormStatus } from 'react-dom' // hook para estado do formulário
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
import { useState } from 'react'
import AutocompleteInput from '@/app/components/deck/AutocompleteInput'

const initialState = {
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-600" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A criar deck...</> : <><PlusCircle className="mr-2 h-4 w-4" /> Criar Deck</>}
    </Button>
  )
}

export default function CreateDeckPage() {
  const [state, formAction] = useActionState(createDeck, initialState)
  const [isPublic, setIsPublic] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [commander, setCommander] = useState('')

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

        <form action={formAction} className="p-8 bg-neutral-900 rounded-lg border border-neutral-800 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-semibold">Nome do Deck</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Ex: Mono Black Control"
              className="bg-neutral-800 border-neutral-700 focus:ring-amber-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="format" className="text-lg font-semibold">Formato</Label>
              <Select name="format" required onValueChange={setSelectedFormat}>
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
                    <Switch 
                        id="is_public" 
                        name="is_public" 
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                    />
                    <Label htmlFor="is_public" className="flex items-center gap-2 cursor-pointer">
                        {isPublic ? <Globe size={16} className="text-green-400"/> : <Lock size={16} className="text-red-400"/>}
                        <span>{isPublic ? 'Público' : 'Privado'}</span>
                    </Label>
                </div>
            </div>
          </div>

          {/* Campo do Comandante - Renderizado Condicionalmente */}
          {selectedFormat === 'commander' && (
            <div className="space-y-2">
              <Label htmlFor="commander" className="text-lg font-semibold">Comandante</Label>
              <AutocompleteInput 
                onSelect={(card) => card ? setCommander(card.name) : setCommander('')} 
                placeholder="Digite o nome do seu comandante..."
              />
              {/* Input escondido para enviar o valor do comandante com o formulário */}
              <input type="hidden" name="commander" value={commander} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-semibold">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Descreva a estratégia principal, combos ou como o deck funciona."
              rows={4}
              className="bg-neutral-800 border-neutral-700 focus:ring-amber-500"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="decklist" className="text-lg font-semibold">
              Lista de Cartas {selectedFormat === 'commander' && '(as 99, sem o comandante)'}
            </Label>
            <Textarea
              id="decklist"
              name="decklist"
              required
              placeholder={
                `Cole a sua lista aqui.
                Formato esperado:
                1 Sol Ring
                4 Swords to Plowshares

                Sideboard
                1 Rest in Peace`
              }
              rows={20}
              className="bg-neutral-800 border-neutral-700 font-mono text-sm focus:ring-amber-500"
            />
          </div>

          {state.message && (
             <Alert variant="destructive">
               <AlertTitle>Erro</AlertTitle>
               <AlertDescription>{state.message}</AlertDescription>
             </Alert>
          )}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
