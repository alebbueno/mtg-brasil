// app/components/deck/DeckPrivacyToggle.tsx
'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { updateDeckPrivacy } from '@/app/(site)/actions/deckActions'
import { toast } from 'sonner' // Usando sonner para notificações (opcional)

interface DeckPrivacyToggleProps {
  deckId: string
  initialIsPublic: boolean
}

export function DeckPrivacyToggle({ deckId, initialIsPublic }: DeckPrivacyToggleProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true)
    setIsPublic(checked)

    try {
      await updateDeckPrivacy(deckId, checked)
      toast.success(`Deck agora é ${checked ? 'público' : 'privado'}.`)
    } catch (error: any) {
      toast.error(error.message)
      // Reverte a alteração visual em caso de erro
      setIsPublic(!checked)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="privacy-mode"
        checked={isPublic}
        onCheckedChange={handleToggle}
        disabled={isLoading}
      />
      <Label htmlFor="privacy-mode" className="text-neutral-300">
        {isLoading ? 'A guardar...' : (isPublic ? 'Público' : 'Privado')}
      </Label>
    </div>
  )
}