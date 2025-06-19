/* eslint-disable no-console */
/* eslint-disable no-undef */
import { createClient } from "@/app/utils/supabase/server";
import PostCard from "../../components/blog/PostCard";
import FeaturedPostCard from "../../components/blog/FeaturedPostCard";
import PaginationControls from "../../components/blog/PaginationControls";

export const metadata = {
  title: 'Hub de Conteúdo | MTG Translate',
  description: 'Explore artigos, guias e análises sobre o universo de Magic: The Gathering.',
};

// A página agora aceita `searchParams` para saber em qual página está
export default async function BlogHubPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const supabase = createClient();
  const currentPage = Number(searchParams?.page) || 1;
  const POSTS_IN_GRID = 9; // 9 posts na grade paginada
  const POSTS_IN_FEATURED = 1; // 1 post em destaque
  
  // Para a primeira página (page=1), buscamos 10 posts (1 destaque + 9 grade)
  // Para as páginas seguintes, buscamos apenas 9 (só a grade)
  const postsPerPage = currentPage === 1 ? POSTS_IN_FEATURED + POSTS_IN_GRID : POSTS_IN_GRID;
  const offset = currentPage === 1 ? 0 : POSTS_IN_FEATURED + (currentPage - 2) * POSTS_IN_GRID;


  // 1. Busca a contagem total de posts para calcular o total de páginas
  const { count: totalPosts, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  if (countError) {
    console.error("Erro ao contar posts:", countError);
  }

  // 2. AJUSTE: A busca de posts agora chama a nossa nova função RPC
  const { data: posts, error } = await supabase
    .rpc('get_published_posts_paginated', { 
      page_size: postsPerPage,
      page_offset: offset 
    });

  if (error) {
    console.error("Erro ao buscar posts para o hub com RPC:", error);
  }
  
  // 3. Separa o post em destaque dos demais (só na primeira página)
  const featuredPost = currentPage === 1 ? posts?.[0] : null;
  const regularPosts = currentPage === 1 ? posts?.slice(1) || [] : posts || [];

  // 4. Calcula o número total de páginas
  const totalPages = Math.ceil((totalPosts || 0) / POSTS_IN_GRID);

  return (
    <div>
      <header className="mb-12 border-b border-neutral-800 pb-6">
        <h1 className="text-5xl font-extrabold text-amber-500 tracking-tight">Hub de Conteúdo</h1>
        <p className="text-lg text-neutral-400 mt-2">Todos os nossos artigos, análises e guias para você.</p>
      </header>

      {/* Renderiza o post em destaque, apenas na primeira página */}
      {featuredPost && <FeaturedPostCard post={featuredPost} />}

      {/* Renderiza o grid com os posts da página atual */}
      {regularPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        // Mostra esta mensagem se não houver posts na grade (ex: última página incompleta)
        currentPage === 1 && <p className="text-center text-neutral-500 py-10">Nenhum artigo publicado ainda.</p>
      )}

      {/* Renderiza os controles de paginação */}
      <PaginationControls totalPages={totalPages} currentPage={currentPage} />
    </div>
  );
}