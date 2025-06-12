/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// app/my-deck/[format]/[id]/edit/components/DeckInfoForm.tsx
'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import AutocompleteInput from '@/app/components/deck/AutocompleteInput';
import type { ScryfallCard } from '@/app/lib/types';
import { ImagePlus, Loader2 } from 'lucide-react'; // Importa o ícone de loading

type DeckInfoFormProps = {
  description: string;
  onDescriptionChange: (value: string) => void;
  isPublic: boolean;
  onIsPublicChange: (value: boolean) => void;
  coverImageUrl: string;
  onCoverImageSelect: (card: ScryfallCard | null) => void;
  onCoverImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // Prop para indicar se uma imagem está a ser carregada
  isUploading: boolean;
};

export default function DeckInfoForm({ 
  description, 
  onDescriptionChange, 
  isPublic,
  onIsPublicChange,
  coverImageUrl, 
  onCoverImageSelect,
  onCoverImageUpload,
  isUploading // Recebe a nova prop
}: DeckInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader><CardTitle>Informações Gerais</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" value={description} onChange={e => onDescriptionChange(e.target.value)} rows={5} disabled={isUploading} />
        </div>
        <div className="space-y-2">
          <Label>Imagem de Capa</Label>
          {coverImageUrl && (
            <div className="relative w-full aspect-[672/240] rounded-md overflow-hidden mt-1 bg-neutral-700">
                {/* A 'key' força o React a recarregar o componente de imagem quando a URL muda */}
                <Image 
                  key={coverImageUrl}
                  src={coverImageUrl} 
                  alt="Capa do deck" 
                  fill
                  className="object-cover" 
                />
            </div>
          )}
          <div className="pt-2 space-y-2">
              <p className="text-xs text-neutral-400">Escolha uma arte de carta ou carregue a sua própria imagem.</p>
              <AutocompleteInput onSelect={onCoverImageSelect} placeholder="Buscar carta para capa..." />
              
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onCoverImageUpload} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp" 
                  disabled={isUploading}
              />
              <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
              >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 h-4 w-4" />
                  )}
                  {isUploading ? 'A carregar...' : 'Carregar Imagem'}
              </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
            <Label htmlFor="is_public">Deck Público</Label>
            <Switch id="is_public" checked={isPublic} onCheckedChange={onIsPublicChange} disabled={isUploading} />
        </div>
      </CardContent>
    </Card>
  );
}
