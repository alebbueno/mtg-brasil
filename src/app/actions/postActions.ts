/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { createClient } from '@/app/utils/supabase/server';
import { checkUserRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Função para criar um 'slug' amigável para URL a partir de um título.
function generateSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug;
}

interface PostFormState {
  message: string;
  success?: boolean;
}

/**
 * Ação para CRIAR um novo post no blog.
 */
export async function createPost(prevState: PostFormState, formData: FormData): Promise<PostFormState> {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { message: "Acesso negado. Apenas administradores podem criar posts." };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Usuário não encontrado." };
  
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as string;
  const cover_image_url = formData.get('cover_image_url') as string;
  const excerpt = formData.get('excerpt') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const categoryIds = formData.getAll('category_ids') as string[];

  if (!title || title.trim().length < 5) {
    return { message: "O título precisa ter pelo menos 5 caracteres." };
  }
  if (!content) {
    return { message: "O conteúdo do artigo não pode estar vazio." }
  }

  const slug = generateSlug(title);

  const { data: newPost, error: postError } = await supabase.from('posts').insert({
    author_id: user.id,
    title,
    slug,
    content,
    status,
    cover_image_url,
    excerpt,
    meta_title,
    meta_description,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).select('id').single();

  if (postError) {
    console.error("Erro ao criar post:", postError);
    if (postError.code === '23505') { // Erro de slug/título duplicado
      return { message: "Já existe um post com um título parecido. Por favor, escolha outro." };
    }
    return { message: "Erro no banco de dados ao criar o post." };
  }

  if (categoryIds && categoryIds.length > 0) {
    const postCategoryLinks = categoryIds.map(categoryId => ({
      post_id: newPost.id,
      category_id: categoryId
    }));
    const { error: categoryError } = await supabase.from('post_categories').insert(postCategoryLinks);
    if (categoryError) {
      console.error("Erro ao lincar categorias:", categoryError);
      return { message: "Post criado, mas houve um erro ao salvar as categorias." };
    }
  }

  revalidatePath('/blog');
  revalidatePath('/admin/blog');
  redirect('/admin/blog');
}


/**
 * Ação para ATUALIZAR um post existente.
 */
export async function updatePost(postId: string, prevState: PostFormState, formData: FormData): Promise<PostFormState> {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    return { message: "Acesso negado." };
  }
  
  const supabase = createClient();
  
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const status = formData.get('status') as string;
  const cover_image_url = formData.get('cover_image_url') as string;
  const excerpt = formData.get('excerpt') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const categoryIds = formData.getAll('category_ids') as string[];
  
  if (!title || title.trim().length < 5) {
    return { message: "O título precisa ter pelo menos 5 caracteres." };
  }

  const slug = generateSlug(title);

  const { data: originalPost } = await supabase.from('posts').select('published_at').eq('id', postId).single();

  const { error: postError } = await supabase
    .from('posts')
    .update({
      title,
      slug,
      content,
      status,
      cover_image_url,
      excerpt,
      meta_title,
      meta_description,
      published_at: status === 'published' && !originalPost?.published_at ? new Date().toISOString() : originalPost?.published_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId);

  if (postError) {
    console.error("Erro ao atualizar post:", postError);
    return { message: "Erro no banco de dados ao atualizar o post." };
  }
  
  const { error: deleteError } = await supabase.from('post_categories').delete().eq('post_id', postId);
  if (deleteError) {
    console.error('Erro ao deletar categorias antigas:', deleteError);
    return { message: "Post atualizado, mas houve um erro ao sincronizar as categorias." };
  }
  
  if (categoryIds && categoryIds.length > 0) {
    const postCategoryLinks = categoryIds.map(categoryId => ({
      post_id: postId,
      category_id: categoryId
    }));
    const { error: insertError } = await supabase.from('post_categories').insert(postCategoryLinks);
    if (insertError) {
      console.error('Erro ao inserir novas categorias:', insertError);
      return { message: "Post atualizado, mas houve um erro ao salvar as novas categorias." };
    }
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  
  return { message: "Artigo atualizado com sucesso!", success: true };
}


/**
 * Função de upload de imagem
 */
export async function uploadImage(formData: FormData): Promise<{ location: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Apenas usuários autenticados podem fazer upload de imagens.");
    
    const file = formData.get('file') as File;
    if (!file) throw new Error("Nenhum arquivo encontrado.");

    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-]/g, '_');
    const filePath = `${user.id}/${Date.now()}-${cleanFileName}.${fileExt}`;
    const bucket = 'blog-assets';

    const { error } = await supabase.storage.from(bucket).upload(filePath, file);
    if (error) throw new Error("Não foi possível enviar a imagem.");

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    if (!data.publicUrl) throw new Error("Não foi possível obter a URL pública da imagem.");
    
    return { location: data.publicUrl };
}