/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { headers } from 'next/headers';
import { checkUserRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Schema de validação base, para campos que sempre existem
const BaseFeedbackSchema = z.object({
  feedback_type: z.string().min(1, { message: 'Por favor, selecione um tipo de feedback.' }),
  content: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' }),
});

// Schema que estende o base, para usuários não logados (visitantes)
const AnonymousFeedbackSchema = BaseFeedbackSchema.extend({
  user_name: z.string().optional(),
  // Permite que o email seja uma string de email, uma string vazia, ou nulo/undefined
  user_email: z.string().email({ message: 'O email fornecido é inválido.' }).nullable().optional().or(z.literal('')),
});

interface FormState {
  message: string;
  success: boolean;
}

export async function submitFeedback(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 1. PRIMEIRO, verifica se o usuário está logado
  const { data: { user } } = await supabase.auth.getUser();

  // 2. DEPOIS, escolhe o schema de validação correto
  const schemaToUse = user ? BaseFeedbackSchema : AnonymousFeedbackSchema;
  
  const validatedFields = schemaToUse.safeParse({
    feedback_type: formData.get('feedback_type'),
    content: formData.get('content'),
    user_name: formData.get('user_name'),
    user_email: formData.get('user_email'),
  });

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    console.error("Erro de Validação Zod:", errors);
    const errorMessage = Object.values(errors)[0]?.[0] || 'Dados inválidos.';
    return { success: false, message: errorMessage };
  }
  
  const { feedback_type, content } = validatedFields.data;
  // Apenas pega o nome e email se a validação para anônimos foi usada
  const user_name = 'user_name' in validatedFields.data ? validatedFields.data.user_name : null;
  const user_email = 'user_email' in validatedFields.data ? validatedFields.data.user_email : null;
  
  const headerList = await headers();
  const page_url = headerList.get('referer');
  const user_agent = headerList.get('user-agent');

  const { error: dbError } = await supabase.from('feedback').insert({
    content,
    feedback_type,
    page_url,
    user_agent,
    user_id: user?.id,
    user_email: user ? user.email : user_email,
    user_name: user ? user.user_metadata.full_name : user_name,
  });

  if (dbError) {
    console.error("Erro ao guardar feedback no Supabase:", dbError);
    return { message: "Não foi possível guardar o seu feedback. Tente novamente.", success: false };
  }
  
  try {
    await resend.emails.send({
      from: 'Feedback <feedback@decksage.com.br>',
      to: ['decksage.br@gmail.com'],
      subject: `Novo Feedback: ${feedback_type}`,
      html: `<p><strong>Tipo:</strong> ${feedback_type}</p><p><strong>Mensagem:</strong></p><blockquote style="border-left: 2px solid #ccc; padding-left: 1em; margin-left: 1em; color: #666;">${content}</blockquote><hr><p><strong>URL:</strong> ${page_url}</p><p><strong>Enviado por:</strong> ${user ? `${user.email} (ID: ${user.id})` : `${user_name || 'Anônimo'} (${user_email || 'Email não fornecido'})`}</p><p><small><strong>User Agent:</strong> ${user_agent}</small></p>`,
    });
  } catch (emailError) {
    console.error("Erro ao enviar e-mail de feedback:", emailError);
  }

  return { message: 'Obrigado! O seu feedback foi enviado com sucesso.', success: true };
}


export async function updateFeedbackStatus(feedbackId: string, newStatus: 'new' | 'in_analysis' | 'completed' | 'unnecessary') {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) { throw new Error('Acesso negado.'); }
  const supabase = createClient();
  const { error } = await supabase.from('feedback').update({ status: newStatus }).eq('id', feedbackId);
  if (error) { throw new Error('Não foi possível atualizar o status.'); }
  revalidatePath('/admin/feedback');
  revalidatePath(`/admin/feedback/${feedbackId}`);
}

export async function addFeedbackComment(feedbackId: string, prevState: any, formData: FormData) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) { return { success: false, message: 'Acesso negado.' }; }
  const commentText = formData.get('comment') as string;
  if (!commentText || commentText.trim().length < 1) { return { success: false, message: 'O comentário não pode estar vazio.' }; }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { return { success: false, message: 'Usuário não autenticado.' }; }
  const { error } = await supabase.from('feedback_comments').insert({ feedback_id: feedbackId, admin_id: user.id, comment: commentText });
  if (error) { return { success: false, message: 'Não foi possível adicionar o comentário.' }; }
  revalidatePath(`/admin/feedback/${feedbackId}`);
  return { success: true, message: 'Comentário adicionado.' };
}