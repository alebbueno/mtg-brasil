/* eslint-disable no-unused-vars */
'use client'

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  const buttonText = isEditing ? "Salvar Alterações" : "Criar Slot de Anúncio";
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {buttonText}
    </Button>
  );
}

interface EditAdFormProps {
    formAction: (prevState: any, formData: FormData) => Promise<any>;
    adSlot?: any;
}

export default function EditAdForm({ formAction, adSlot }: EditAdFormProps) {
  const [state, dispatch] = useFormState(formAction, { message: '', success: false });
  const [adType, setAdType] = useState(adSlot?.ad_type || 'adsense');
  const isEditing = !!adSlot;

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={dispatch}>
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle>{isEditing ? 'Editando Slot' : 'Criar Novo Slot de Anúncio'}</CardTitle>
          <CardDescription>
            {isEditing ? `Configure o slot: ${adSlot.slot_name}` : 'Defina um novo espaço para anúncios no site.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch id="is_active" name="is_active" defaultChecked={isEditing ? adSlot.is_active : true} />
            <Label htmlFor="is_active">Anúncio Ativo</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slot_name">Nome do Slot (Identificador)</Label>
            <Input 
                name="slot_name" 
                defaultValue={adSlot?.slot_name || ''} 
                placeholder="ex: homepage_banner (sem espaços ou acentos)"
                required
                disabled={isEditing}
                className="bg-neutral-800 border-neutral-700 font-mono disabled:opacity-50"
            />
            {isEditing && <p className="text-xs text-neutral-500">O nome do slot não pode ser alterado após a criação.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad_type">Tipo de Anúncio</Label>
            <Select name="ad_type" value={adType} onValueChange={(value) => setAdType(value)}>
              <SelectTrigger className="w-[280px] bg-neutral-800 border-neutral-700"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                <SelectItem value="adsense">Google AdSense</SelectItem>
                <SelectItem value="custom">Anúncio Particular (Imagem)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {adType === 'adsense' && (
            <div className="p-4 border-l-4 border-amber-500 bg-neutral-800/50 rounded-r-lg space-y-4 animate-in fade-in">
              <h3 className="font-semibold">Configuração do AdSense</h3>
              <div className="space-y-2">
                <Label htmlFor="adsense_client_id">Client ID (ca-pub-...)</Label>
                <Input name="adsense_client_id" defaultValue={adSlot?.adsense_client_id || ''} className="bg-neutral-800 border-neutral-700 font-mono"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adsense_slot_id">Slot ID</Label>
                <Input name="adsense_slot_id" defaultValue={adSlot?.adsense_slot_id || ''} className="bg-neutral-800 border-neutral-700 font-mono"/>
              </div>
            </div>
          )}

          {adType === 'custom' && (
            <div className="p-4 border-l-4 border-sky-500 bg-neutral-800/50 rounded-r-lg space-y-4 animate-in fade-in">
              <h3 className="font-semibold">Configuração de Anúncio Particular</h3>
              <div className="space-y-2">
                <Label htmlFor="custom_image_url">URL da Imagem do Banner</Label>
                <Input name="custom_image_url" defaultValue={adSlot?.custom_image_url || ''} className="bg-neutral-800 border-neutral-700"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_link_url">URL de Destino (Link)</Label>
                <Input name="custom_link_url" defaultValue={adSlot?.custom_link_url || ''} className="bg-neutral-800 border-neutral-700"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_alt_text">Texto Alternativo da Imagem (alt)</Label>
                <Input name="custom_alt_text" defaultValue={adSlot?.custom_alt_text || ''} className="bg-neutral-800 border-neutral-700"/>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="bg-black/20 p-6 flex justify-between items-center">
          {state?.message && !state.success && (
            <Alert variant="destructive" className="p-3"><AlertDescription>{state.message}</AlertDescription></Alert>
          )}
          <div className="flex-grow"></div>
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}