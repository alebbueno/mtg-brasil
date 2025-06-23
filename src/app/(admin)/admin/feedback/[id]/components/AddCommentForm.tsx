'use client'

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addFeedbackComment } from '@/app/actions/feedbackActions';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
      Adicionar Comentário
    </Button>
  );
}

// O estado inicial agora é um objeto
const initialState = { message: '', success: false };

export default function AddCommentForm({ feedbackId }: { feedbackId: string }) {
  const addCommentWithId = addFeedbackComment.bind(null, feedbackId);
  const [state, formAction] = useActionState(addCommentWithId, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // O efeito agora verifica o estado de sucesso para limpar o formulário e mostrar um toast
  useEffect(() => {
    if (state?.message) {
        if (state.success) {
            toast.success(state.message);
            formRef.current?.reset();
        } else {
            toast.error(state.message);
        }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <Textarea
        name="comment"
        placeholder="Adicione uma nota interna ou comentário..."
        required
        rows={4}
        className="bg-neutral-800 border-neutral-700"
      />
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}