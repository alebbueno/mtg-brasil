/* eslint-disable no-console */
/* eslint-disable no-undef */
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Monitor, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UpdateStatusForm from './components/UpdateStatusForm';
import AddCommentForm from './components/AddCommentForm';
import { Label } from '@radix-ui/react-label';

// O tipo das props para referência interna
interface PageProps {
  params: {
    id: string;
  };
}

const statusStyles: Record<string, string> = {
    'new': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'in_analysis': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'completed': 'bg-green-500/20 text-green-300 border-green-500/30',
    'unnecessary': 'bg-neutral-700/20 text-neutral-400 border-neutral-700/30',
}

// AJUSTE: Recebemos as props como 'any' e as convertemos para o tipo correto
export default async function FeedbackDetailPage(props: any) {
  const { params } = props as PageProps;

  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  // Defina o tipo esperado para feedback
  interface FeedbackDetails {
    id: string;
    status: string;
    content: string;
    created_at: string;
    page_url?: string;
    user_agent?: string;
    submitter_profile?: {
      username?: string;
      email?: string;
    };
    comments?: Array<{
      id: string;
      admin_username?: string;
      admin_avatar_url?: string;
      created_at: string;
      comment: string;
    }>;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .rpc('get_feedback_details', { p_feedback_id: params.id })
    .single();

  const feedback = data as FeedbackDetails;

  if (error || !feedback) {
    console.error("Erro ao buscar detalhes do feedback:", error);
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <Link href="/admin/feedback" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4">
          <ArrowLeft size={16} />
          Voltar para todos os feedbacks
        </Link>
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-amber-500">Detalhes do Feedback</h1>
            <Badge className={statusStyles[feedback.status] || ''}>{feedback.status}</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle>Mensagem Original</CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-300 text-base whitespace-pre-wrap">
                    {feedback.content}
                </CardContent>
            </Card>

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle>Comentários Internos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {feedback.comments?.map((comment: any) => (
                        <div key={comment.id} className="flex items-start gap-3">
                             <Avatar className="h-9 w-9 mt-1">
                                <AvatarImage src={comment.admin_avatar_url} />
                                <AvatarFallback>{comment.admin_username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-neutral-800/50 rounded-lg p-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <p className="font-bold text-amber-400">@{comment.admin_username}</p>
                                    <p className="text-neutral-500">{new Date(comment.created_at).toLocaleString('pt-BR')}</p>
                                </div>
                                <p className="text-neutral-300 text-sm whitespace-pre-wrap">{comment.comment}</p>
                            </div>
                        </div>
                    )) || <p className="text-sm text-neutral-500">Nenhum comentário ainda.</p>}
                </CardContent>
            </Card>
        </div>

        {/* Barra Lateral de Ações e Informações */}
        <aside className="lg:sticky lg:top-8 space-y-6">
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Mudar Status</Label>
                        <UpdateStatusForm feedbackId={feedback.id} currentStatus={feedback.status} />
                    </div>
                    <div>
                        <Label>Adicionar Comentário</Label>
                        <AddCommentForm feedbackId={feedback.id} />
                    </div>
                </CardContent>
            </Card>

             <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle>Detalhes da Submissão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-neutral-400">
                    <div className="flex items-center gap-2"><User size={16}/> <strong>Usuário:</strong> {feedback.submitter_profile?.username ? `@${feedback.submitter_profile.username}` : (feedback.submitter_profile?.email || 'Anônimo')}</div>
                    <div className="flex items-center gap-2"><Clock size={16}/> <strong>Enviado em:</strong> {new Date(feedback.created_at).toLocaleString('pt-BR')}</div>
                    <div className="flex items-start gap-2"><Link href={feedback.page_url || '#'} target="_blank" className="truncate hover:text-amber-400"><strong>URL:</strong> {feedback.page_url || 'Não informada'}</Link></div>
                    <div className="flex items-start gap-2"><Monitor size={16}/> <span className="truncate" title={feedback.user_agent || ''}><strong>Agente:</strong> {feedback.user_agent || 'Não informado'}</span></div>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}