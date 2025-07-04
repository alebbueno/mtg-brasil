/* eslint-disable no-undef */
'use client'

import { useActionState, useEffect, useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquarePlus, Loader2 } from 'lucide-react';
import { submitFeedback } from '@/app/actions/feedbackActions';
import type { User } from '@supabase/supabase-js';

const initialState = { message: '', success: false };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-amber-500 text-black hover:bg-amber-600">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Feedback'}
    </Button>
  );
}

export default function FloatingFeedback({ user }: { user: User | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(submitFeedback, initialState);
  const pathname = usePathname();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        setIsOpen(false);
        formRef.current?.reset();
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="fixed bottom-5 right-5 h-16 w-16 rounded-full bg-amber-500 shadow-lg hover:bg-amber-600 z-50 transform transition-transform hover:scale-110">
          <MessageSquarePlus className="h-8 w-8 text-black" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-96 bg-neutral-900 border-neutral-700 text-neutral-100 p-6 rounded-xl shadow-2xl mr-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none text-amber-500 text-lg">Envie o seu Feedback</h4>
            <p className="text-sm text-neutral-400">Sua opinião é muito importante! Ajude-nos a melhorar.</p>
          </div>
          
          <form ref={formRef} action={formAction} className="space-y-4">
            <input type="hidden" name="page_url" value={typeof window !== 'undefined' ? `${window.location.origin}${pathname}` : ''} />

            {!user && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="user_name">Seu Nome</Label>
                    <Input id="user_name" name="user_name" placeholder="Opcional" className="bg-neutral-800 border-neutral-700"/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="user_email">Seu Email</Label>
                    <Input id="user_email" name="user_email" type="email" placeholder="Opcional" className="bg-neutral-800 border-neutral-700"/>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="feedback_type">Tipo de Feedback</Label>
              <Select name="feedback_type" required>
                  <SelectTrigger className="bg-neutral-800 border-neutral-700 focus:ring-amber-500"><SelectValue placeholder="Selecione uma opção..." /></SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                      <SelectItem value="bug">Reportar um Bug</SelectItem>
                      <SelectItem value="suggestion">Sugestão de Funcionalidade</SelectItem>
                      <SelectItem value="praise">Elogio</SelectItem>
                      <SelectItem value="other">Outro Assunto</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="content">A sua mensagem</Label>
              <Textarea
                id="content"
                name="content"
                required
                minLength={10}
                placeholder="Descreva o bug que encontrou ou a sua ideia..."
                rows={6}
                className="bg-neutral-800 border-neutral-700 focus:ring-amber-500"
              />
            </div>
            <div className="flex justify-end pt-2">
                <SubmitButton />
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}