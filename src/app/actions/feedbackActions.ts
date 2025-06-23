/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { headers } from 'next/headers'; // Importa o 'headers' para pegar dados da requisição
import { checkUserRole } from '@/lib/auth'; // Importa nossa função de verificação de cargo
import { revalidatePath } from 'next/cache';

// Schema de validação para o formulário de feedback (mantido)
const FeedbackSchema = z.object({
  feedback_type: z.string().min(1, 'Por favor, selecione um tipo de feedback.'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.'),
});

interface FormState {
  message: string;
  success: boolean;
}

/**
 * Ação PÚBLICA que permite a qualquer usuário enviar um feedback.
 * Versão melhorada para capturar mais dados.
 */
export async function submitFeedback(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const validatedFields = FeedbackSchema.safeParse({
    feedback_type: formData.get('feedback_type'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.message?.[0] || 'Dados inválidos.',
      success: false,
    };
  }
  
  const { feedback_type, message } = validatedFields.data;

  // Pega o usuário logado, se houver
  const { data: { user } } = await supabase.auth.getUser();

  // AJUSTE: Pega cabeçalhos para informações extras e automáticas
  const headerList = await headers();
  const page_url = headerList.get('referer'); // URL da página de onde o feedback foi enviado
  const user_agent = headerList.get('user-agent'); // Navegador e Sistema Operacional do usuário

  // 1. Guarda o feedback na base de dados
  const { error: dbError } = await supabase.from('feedback').insert({
    feedback_type,
    content: message, // Usamos 'content' na tabela, como planejado
    page_url,
    user_agent,
    user_id: user?.id,
    user_email: user?.email, // Salva o email se o usuário estiver logado
  });

  if (dbError) {
    console.error("Erro ao guardar feedback no Supabase:", dbError);
    return { message: "Não foi possível guardar o seu feedback. Tente novamente.", success: false };
  }
  
  // 2. Envia o e-mail de notificação (sua lógica original mantida)
  try {
    await resend.emails.send({
      from: 'Feedback <feedback@decksage.com.br>', // Use um e-mail do seu domínio verificado
      to: ['alebueno.dev@gmail.com'], // E-mail para receber os feedbacks
      subject: `Novo Feedback: ${feedback_type}`,
      html: `
        <h1>Novo Feedback Recebido!</h1>
        <p><strong>Tipo:</strong> ${feedback_type}</p>
        <p><strong>Mensagem:</strong></p>
        <blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; color: #666;">${message}</blockquote>
        <hr>
        <p><strong>Enviado da página:</strong> ${page_url}</p>
        <p><strong>Enviado por:</strong> ${user ? `${user.email} (ID: ${user.id})` : 'Visitante não logado'}</p>
        <p><small><strong>User Agent:</strong> ${user_agent}</small></p>
      `,
    });
  } catch (emailError) {
    console.error("Erro ao enviar e-mail de feedback:", emailError);
  }

  return { message: 'Obrigado! O seu feedback foi enviado com sucesso.', success: true };
}


// --- AÇÕES PARA O PAINEL DE ADMIN ---

/**
 * Ação de ADMIN para atualizar o status de um feedback.
 */
export async function updateFeedbackStatus(feedbackId: string, newStatus: 'new' | 'in_analysis' | 'completed' | 'unnecessary') {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    throw new Error('Acesso negado.');
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('feedback')
    .update({ status: newStatus })
    .eq('id', feedbackId);

  if (error) {
    console.error('Erro ao atualizar status do feedback:', error);
    throw new Error('Não foi possível atualizar o status.');
  }

  // Revalida o cache para que a lista e a página de detalhes mostrem o novo status
  revalidatePath('/admin/feedback');
  revalidatePath(`/admin/feedback/${feedbackId}`);
}


/**
 * Ação de ADMIN para adicionar um comentário a um feedback.
 */
export async function addFeedbackComment(feedbackId: string, prevState: any, formData: FormData) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  const commentText = formData.get('comment') as string;
  if (!commentText || commentText.trim().length < 1) {
    return { success: false, message: 'O comentário não pode estar vazio.' };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: 'Usuário não autenticado.' };

  const { error } = await supabase.from('feedback_comments').insert({
      feedback_id: feedbackId,
      admin_id: user.id,
      comment: commentText,
  });

  if (error) {
    console.error('Erro ao adicionar comentário de feedback:', error);
    return { success: false, message: 'Não foi possível adicionar o comentário.' };
  }

  revalidatePath(`/admin/feedback/${feedbackId}`);
  
  // AJUSTE: Retorna um estado de sucesso para o formulário poder reagir
  return { success: true, message: 'Comentário adicionado.' };
}