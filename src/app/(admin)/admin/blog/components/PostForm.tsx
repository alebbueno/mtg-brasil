/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use client'

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Image from 'next/image';

import { uploadImage } from '@/app/actions/postActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CategoryManager from './CategoryManager';

const Editor = dynamic(() => import('./Editor'), { 
    ssr: false,
    loading: () => <div className="p-4 text-neutral-400 border border-neutral-700 rounded-md min-h-[500px]">Carregando editor...</div> 
});

const initialState = { message: '', success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="bg-amber-500 text-black hover:bg-amber-600 w-full" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Alterações</>}
    </Button>
  );
}

// Props para o formulário, agora incluindo a lista de todas as categorias
interface PostFormProps {
  formAction: (prevState: any, formData: FormData) => Promise<any>;
  initialData?: any; 
  allCategories: { id: string; name: string }[];
}

export default function PostForm({ formAction, initialData, allCategories }: PostFormProps) {
  const [state, dispatch] = useActionState(formAction, initialState);
  
  const [content, setContent] = useState<string>(initialData?.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState<string>(initialData?.cover_image_url || '');
  
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  // Extrai os IDs das categorias já selecionadas no post para marcar os checkboxes
  const selectedCategoryIds = new Set<string>(initialData?.categories?.map((cat: any) => cat.id) || []);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error("Erro: " + state.message);
      }
    }
  }, [state]);

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

  return (
    <form action={dispatch} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna Principal (Esquerda) */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold">Título do Artigo</Label>
              <Input id="title" name="title" required defaultValue={initialData?.title || ''} className="bg-neutral-800 border-neutral-700 h-12 text-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Conteúdo Principal</Label>
              <div className="bg-neutral-950 rounded-md border border-neutral-700 min-h-[500px]">
                 <Editor
                    initialValue={initialData?.content || ''}
                    onEditorChange={(newContent) => {
                      setContent(newContent);
                    }}
                  />
              </div>
              <input type="hidden" name="content" value={content} />
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
              <Label>Imagem de Capa</Label>
              <div className="w-full aspect-video rounded-lg border-2 border-dashed border-neutral-700 flex items-center justify-center relative bg-neutral-950/50 overflow-hidden hover:border-amber-500 transition-colors">
                {coverImageUrl ? <Image src={coverImageUrl} alt="Preview da capa" fill className="object-cover" /> : <div className="text-center text-neutral-500 p-4"><UploadCloud className="mx-auto h-10 w-10" /><p className="mt-2 text-sm">Clique para selecionar</p></div>}
                {isUploadingCover && <div className="absolute inset-0 bg-black/70 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
                <Input type="file" accept="image/*" onChange={handleCoverImageUpload} disabled={isUploadingCover} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <input type="hidden" name="cover_image_url" value={coverImageUrl} />
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={initialData?.status || 'draft'}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700"><SelectItem value="draft">Rascunho</SelectItem><SelectItem value="published">Publicado</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="pt-2"><SubmitButton /></div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Categorias</CardTitle></CardHeader>
          <CardContent>
            <CategoryManager
              allCategories={allCategories}
              selectedCategoryIds={selectedCategoryIds}
            />
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader><CardTitle>Resumo & SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="excerpt">Resumo (Excerpt)</Label><Textarea id="excerpt" name="excerpt" rows={4} defaultValue={initialData?.excerpt || ''} className="bg-neutral-800 border-neutral-700" placeholder="Um resumo curto para a lista do blog."/></div>
            <div className="space-y-2"><Label htmlFor="meta_title">Título para SEO</Label><Input id="meta_title" name="meta_title" defaultValue={initialData?.meta_title || ''} className="bg-neutral-800 border-neutral-700" placeholder="Título que aparecerá no Google."/></div>
            <div className="space-y-2"><Label htmlFor="meta_description">Descrição para SEO</Label><Textarea id="meta_description" name="meta_description" rows={3} defaultValue={initialData?.meta_description || ''} className="bg-neutral-800 border-neutral-700" placeholder="Descrição curta para o Google."/></div>
          </CardContent>
        </Card>
      </aside>

      {state?.message && !state.success && (
        <Alert variant="destructive" className="lg:col-span-3 mt-6">
           <AlertTitle>Ocorreu um Erro</AlertTitle>
           <AlertDescription>{state.message}</AlertDescription>
         </Alert>
      )}
    </form>
  );
}