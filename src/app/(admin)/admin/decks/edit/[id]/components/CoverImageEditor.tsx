/* eslint-disable no-undef */
'use client'

import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { toast } from 'sonner';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AutocompleteInput from '@/app/(site)/components/deck/AutocompleteInput';
import type { ScryfallCard } from '@/app/lib/types';
import { ImageIcon, Loader2, Upload } from 'lucide-react';
import { updateSiteDeckCoverImage } from '@/app/actions/admin/deckAdminActions';
import { Label } from '@radix-ui/react-label';

interface CoverImageEditorProps {
  deckId: string;
  initialImageUrl: string | null;
}

export default function CoverImageEditor({ deckId, initialImageUrl }: CoverImageEditorProps) {
  const supabase = createClient();
  const [coverImageUrl, setCoverImageUrl] = useState(initialImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleSelectCard = (card: ScryfallCard | null) => {
    if (!card) return;
    const newUrl = card.image_uris?.art_crop || card.image_uris?.normal || '';
    setCoverImageUrl(newUrl);
    toast.promise(updateSiteDeckCoverImage(deckId, newUrl), {
      loading: 'Atualizando imagem de capa...',
      success: 'Imagem de capa atualizada!',
      error: 'Falha ao atualizar a imagem.'
    });
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const filePath = `covers/${user.id}/${deckId}-${Date.now()}`;
    
    setIsUploading(true);
    try {
      await supabase.storage.from('covers').upload(filePath, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(filePath);
      if (!publicUrl) throw new Error("URL pública não encontrada.");
      
      await updateSiteDeckCoverImage(deckId, publicUrl);
      setCoverImageUrl(publicUrl);
      toast.success("Upload da imagem de capa concluído!");
    } catch (error: any) {
      toast.error(`Erro no upload: ${error.message}`);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle>Imagem de Capa do Deck</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-[16/9] bg-neutral-950 rounded-lg overflow-hidden border border-neutral-700">
          {coverImageUrl ? (
            <Image src={coverImageUrl} alt="Imagem de capa atual" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                <ImageIcon size={32}/>
                <p className="text-sm mt-2">Sem imagem de capa</p>
            </div>
          )}
        </div>
        <div>
          <Label>Escolher arte de uma carta</Label>
          <AutocompleteInput onSelect={handleSelectCard} placeholder="Buscar por nome de carta..." />
        </div>
        <div className="text-center text-xs text-neutral-500">OU</div>
        <div>
          <Label htmlFor="cover-upload" className="w-full">
            <Button asChild variant="outline" className="w-full cursor-pointer">
              <div>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                <span>Fazer Upload de Imagem</span>
                <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
              </div>
            </Button>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}