/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/components/DeckInfoForm.tsx
'use client';

import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AutocompleteInput from '@/app/components/deck/AutocompleteInput';
import type { ScryfallCard } from '@/app/lib/scryfall';

type DeckInfoFormProps = {
  description: string;
  onDescriptionChange: (value: string) => void;
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
  coverImageUrl: string;
  onCoverImageSelect: (card: ScryfallCard | null) => void;
};

export default function DeckInfoForm({ description, onDescriptionChange, isPublic, onIsPublicChange, coverImageUrl, onCoverImageSelect }: DeckInfoFormProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" value={description} onChange={e => onDescriptionChange(e.target.value)} rows={5} />
        </div>
        <div className="space-y-1">
          <Label>Imagem de Capa</Label>
          <AutocompleteInput onSelect={onCoverImageSelect} placeholder="Buscar carta para capa..." />
          {coverImageUrl && (
            <Image 
              src={coverImageUrl} 
              alt="Capa do deck" 
              width={265} 
              height={194} 
              className="rounded-md mt-2 object-cover w-full" 
            />
          )}
        </div>
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="is_public" className="cursor-pointer">Deck Público</Label>
          <Switch id="is_public" checked={isPublic} onCheckedChange={onIsPublicChange} />
        </div>
      </CardContent>
    </Card>
  );
}