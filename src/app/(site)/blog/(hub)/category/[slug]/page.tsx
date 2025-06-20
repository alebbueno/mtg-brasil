/* eslint-disable no-console */
/* eslint-disable no-undef */
import { createClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import PostCard from "@/app/(site)/components/blog/PostCard";
import PaginationControls from "@/app/(site)/components/blog/PaginationControls";

// A página aceita `params` (para o slug da categoria) e `searchParams` (para a página)
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}) {
  const supabase = createClient();
  const currentPage = Number(searchParams?.page) || 1;
  const POSTS_PER_PAGE = 9; // 9 posts por página, como pedido

  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  // 1. Busca os dados da categoria para usar no título da página
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('name')
    .eq('slug', params.slug)
    .single();

  if (categoryError || !category) {
    notFound(); // Se a categoria não existe, mostra página 404
  }

  // 2. Busca os posts e o total de posts da categoria em paralelo
  const [
    { data: posts, error: postsError }, 
    { data: totalPosts, error: countError }
  ] = await Promise.all([
      supabase.rpc('get_posts_by_category_slug_paginated', { 
        category_slug: params.slug,
        page_size: POSTS_PER_PAGE,
        page_offset: offset 
      }),
      supabase.rpc('count_posts_in_category', { 
        category_slug: params.slug 
      })
  ]);

  if (postsError || countError) {
    console.error("Erro ao buscar posts da categoria:", postsError || countError);
  }

  const totalPages = Math.ceil((totalPosts || 0) / POSTS_PER_PAGE);

  return (
    <div>
      <header className="mb-12 border-b border-neutral-800 pb-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral-200 tracking-tight">
          Categoria: <span className="text-amber-500">{category.name}</span>
        </h1>
        <p className="text-lg text-neutral-400 mt-2">
          Explorando todos os artigos sobre {category.name}.
        </p>
      </header>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral-500 py-10">Nenhum artigo encontrado nesta categoria.</p>
      )}

      {/* Renderiza os controles de paginação */}
      <PaginationControls totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}