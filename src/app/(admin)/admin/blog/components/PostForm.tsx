/* eslint-disable no-undef */
'use client'

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createPost, uploadImage } from '@/app/(site)/actions/postActions';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, UploadCloud } from 'lucide-react';

const Editor = dynamic(() => import('./Editor'), { 
    ssr: false,
    loading: () => <div className="p-4 text-neutral-400 border border-neutral-700 rounded-md min-h-[500px]">Carregando editor...</div> 
});

const initialState = { message: '', success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-amber-500 text-black hover:bg-amber-600 w-full" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Artigo</>}
    </Button>
  );
}

export default function PostForm() {
  const [state, formAction] = useActionState(createPost, initialState);
  const [content, setContent] = useState<string>('');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setIsUploadingCover(true);
    const toastId = toast.loading("Enviando imagem de capa...");

    try {
      const result = await uploadImage(formData);
      setCoverImageUrl(result.location);
      toast.success("Imagem de capa enviada!", { id: toastId });
    } catch (error: any) {
      toast.error(`Falha no upload: ${error.message}`, { id: toastId });
    } finally {
      setIsUploadingCover(false);
    }
  };

  useEffect(() => {
    if (state?.message && !state.success) {
      toast.error("Erro ao salvar: " + state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna Principal (Esquerda) */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6 space-y-4">
            {/* O Bloco da Imagem de Capa foi MOVIDO DAQUI */}
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">Título do Artigo</Label>
              <Input id="title" name="title" required className="bg-neutral-800 border-neutral-700 h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Conteúdo Principal</Label>
              <div className="bg-neutral-950 rounded-md border border-neutral-700 min-h-[500px]">
                 <Editor
                    value={content}
                    onChange={setContent}
                  />
              </div>
              <input type="hidden" name="content" value={content} />
              <input type="hidden" name="cover_image_url" value={coverImageUrl} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra Lateral (Direita) */}
      <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 self-start">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Publicação</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="draft">
                <SelectTrigger className="bg-neutral-800 border-neutral-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700"><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="published">Publicado</SelectItem></SelectContent>
              </Select>
            </div>
            <SubmitButton />
          </CardContent>
        </Card>

        {/* Bloco da Imagem de Capa ADICIONADO AQUI */}
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader><CardTitle>Imagem de Capa</CardTitle></CardHeader>
            <CardContent>
                <div className="w-full aspect-video rounded-md border-2 border-dashed border-neutral-700 flex items-center justify-center relative bg-neutral-950/50 overflow-hidden hover:border-amber-500 transition-colors">
                    {coverImageUrl ? (
                    <Image src={coverImageUrl} alt="Preview da capa" fill className="object-cover" />
                    ) : (
                    <div className="text-center text-neutral-500 p-4">
                        <UploadCloud className="mx-auto h-10 w-10" />
                        <p className="mt-2 text-sm">Clique para selecionar</p>
                    </div>
                    )}
                    {isUploadingCover && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                    )}
                    <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    disabled={isUploadingCover}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Resumo & SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo (Excerpt)</Label>
              <Textarea id="excerpt" name="excerpt" rows={4} className="bg-neutral-800 border-neutral-700" placeholder="Um resumo curto para a lista do blog."/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_title">Título para SEO</Label>
              <Input id="meta_title" name="meta_title" className="bg-neutral-800 border-neutral-700" placeholder="Título que aparecerá no Google."/>
            </div>
             <div className="space-y-2">
              <Label htmlFor="meta_description">Descrição para SEO</Label>
              <Textarea id="meta_description" name="meta_description" rows={3} className="bg-neutral-800 border-neutral-700" placeholder="Descrição curta para o Google."/>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-500">Em breve...</p>
          </CardContent>
        </Card>
      </aside>

    </form>
  );
}