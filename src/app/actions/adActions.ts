/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { checkUserRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface FormState {
  message: string;
  success: boolean;
}

/**
 * Ação de ADMIN para CRIAR um novo slot de anúncio.
 */
export async function createAdSlot(prevState: FormState, formData: FormData): Promise<FormState> {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { message: 'Acesso negado.', success: false };
  }

  const supabase = createClient();

  const slot_name = formData.get('slot_name') as string;
  
  if (!slot_name || slot_name.trim().length < 3) {
    return { message: 'O nome do slot é obrigatório e precisa ter pelo menos 3 caracteres.', success: false };
  }

  // Verifica se o slot já existe para evitar duplicatas
  const { data: existingSlot } = await supabase.from('ad_slots').select('id').eq('slot_name', slot_name.trim()).single();
  if (existingSlot) {
    return { message: 'Um slot com este nome já existe.', success: false };
  }

  const { error } = await supabase.from('ad_slots').insert({
    slot_name: slot_name.trim(),
    ad_type: formData.get('ad_type') as 'adsense' | 'custom',
    is_active: formData.get('is_active') === 'on',
    adsense_client_id: formData.get('adsense_client_id'),
    adsense_slot_id: formData.get('adsense_slot_id'),
    custom_image_url: formData.get('custom_image_url'),
    custom_link_url: formData.get('custom_link_url'),
    custom_alt_text: formData.get('custom_alt_text'),
  });

  if (error) {
    console.error('Erro ao criar ad slot:', error);
    return { message: 'Não foi possível criar o slot de anúncio.', success: false };
  }

  revalidatePath('/admin/ads');
  redirect('/admin/ads');
}


/**
 * Ação de ADMIN para ATUALIZAR um slot de anúncio.
 */
export async function updateAdSlot(slotId: string, prevState: FormState, formData: FormData): Promise<FormState> {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { message: 'Acesso negado.', success: false };
  }

  const supabase = createClient();
  
  const ad_type = formData.get('ad_type') as 'adsense' | 'custom';
  const is_active = formData.get('is_active') === 'on';

  const updates: any = { ad_type, is_active };

  if (ad_type === 'adsense') {
    updates.adsense_client_id = formData.get('adsense_client_id');
    updates.adsense_slot_id = formData.get('adsense_slot_id');
    updates.custom_image_url = null;
    updates.custom_link_url = null;
    updates.custom_alt_text = null;
  } else {
    updates.custom_image_url = formData.get('custom_image_url');
    updates.custom_link_url = formData.get('custom_link_url');
    updates.custom_alt_text = formData.get('custom_alt_text');
    updates.adsense_client_id = null;
    updates.adsense_slot_id = null;
  }

  const { error } = await supabase
    .from('ad_slots')
    .update(updates)
    .eq('id', slotId);
  
  if (error) {
    console.error('Erro ao atualizar ad slot:', error);
    return { message: 'Não foi possível salvar as alterações.', success: false };
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/ads');
  
  return { message: 'Slot de anúncio salvo com sucesso!', success: true };
}