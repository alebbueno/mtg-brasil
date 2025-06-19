/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { checkUserRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Função para criar um 'slug' a partir de um nome de categoria.
function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Cria uma nova categoria no banco de dados.
 */
export async function createCategory(formData: FormData) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { success: false, message: 'Acesso negado.' };
  }

  const categoryName = formData.get('categoryName') as string;
  if (!categoryName || categoryName.trim().length < 2) {
    return { success: false, message: 'O nome da categoria precisa ter pelo menos 2 caracteres.' };
  }
  
  const slug = generateCategorySlug(categoryName);
  const supabase = createClient();

  const { error } = await supabase
    .from('categories')
    .insert({ name: categoryName.trim(), slug });

  if (error) {
    if (error.code === '23505') { // Erro de violação de chave única
      return { success: false, message: 'Esta categoria já existe.' };
    }
    console.error('Erro ao criar categoria:', error);
    return { success: false, message: 'Erro no banco de dados.' };
  }

  // Importante: Revalida o path das páginas que buscam categorias.
  // Isso fará com que a lista de categorias seja atualizada no formulário.
  revalidatePath('/admin/blog/new');
  revalidatePath('/admin/blog/edit', 'layout'); // Revalida todas as páginas de edição

  return { success: true, message: 'Categoria criada com sucesso!' };
}