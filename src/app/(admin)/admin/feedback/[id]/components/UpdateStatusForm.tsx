'use client'

import { useTransition } from 'react';
// import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateFeedbackStatus } from '@/app/actions/feedbackActions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UpdateStatusFormProps {
  feedbackId: string;
  currentStatus: string;
}

export default function UpdateStatusForm({ feedbackId, currentStatus }: UpdateStatusFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (newStatus: string) => {
    startTransition(async () => {
      try {
        await updateFeedbackStatus(feedbackId, newStatus as any);
        toast.success("Status do feedback atualizado!");
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue={currentStatus} onValueChange={handleSubmit} disabled={isPending}>
        <SelectTrigger className="bg-neutral-800 border-neutral-700">
          <SelectValue placeholder="Mudar status..." />
        </SelectTrigger>
        <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
          <SelectItem value="new">Novo</SelectItem>
          <SelectItem value="in_analysis">Em Análise</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="unnecessary">Desnecessário</SelectItem>
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
    </div>
  );
}