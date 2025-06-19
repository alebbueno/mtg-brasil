/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/actions/feedbackActions.ts
'use server'

import { createClient } from '@/app/utils/supabase/server'
import { Resend } from 'resend';
import { z } from 'zod';

// Schema de validação para o formulário
const FeedbackSchema = z.object({
  feedback_type: z.string().min(1, 'Por favor, selecione um tipo de feedback.'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.'),
  page_url: z.string().url(),
});

interface FormState {
  message: string;
  success: boolean;
}

export async function submitFeedback(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Valida os dados do formulário
  const validatedFields = FeedbackSchema.safeParse({
    feedback_type: formData.get('feedback_type'),
    message: formData.get('message'),
    page_url: formData.get('page_url'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.message?.[0] || 'Dados inválidos.',
      success: false,
    };
  }
  
  const { feedback_type, message, page_url } = validatedFields.data;

  // Verifica se há um utilizador logado
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guarda o feedback na base de dados
  const { error: dbError } = await supabase.from('feedback').insert({
    feedback_type,
    message,
    page_url,
    user_id: user?.id, // Associa o feedback ao utilizador, se ele estiver logado
  });

  if (dbError) {
    console.error("Erro ao guardar feedback no Supabase:", dbError);
    return { message: "Não foi possível guardar o seu feedback. Tente novamente.", success: false };
  }
  
  // 2. Envia o e-mail de notificação
  try {
    await resend.emails.send({
      from: 'Feedback SpellBook AI', // Use um e-mail do seu domínio verificado no Resend
      to: ['saas.spellbookai@gmail.com'],          // O seu e-mail para receber os feedbacks
      subject: `Novo Feedback: ${feedback_type}`,
      html: `
        <h1>Novo Feedback Recebido!</h1>
        <p><strong>Tipo:</strong> ${feedback_type}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
        <hr>
        <p><strong>Enviado da página:</strong> ${page_url}</p>
        <p><strong>Utilizador:</strong> ${user ? `${user.email} (ID: ${user.id})` : 'Visitante não logado'}</p>
      `,
    });
  } catch (emailError) {
    console.error("Erro ao enviar e-mail de feedback:", emailError);
    // Não retorna um erro ao utilizador, pois o feedback já foi guardado.
  }

  return { message: 'Obrigado! O seu feedback foi enviado com sucesso.', success: true };
}
