/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/(site)/blog/page.tsx

import { createClient } from "@/app/utils/supabase/server";
import PostCard from "../../components/blog/PostCard"; // Reutilizamos nosso PostCard

export const metadata = {
  title: 'Hub de Conteúdo | MTG Translate',
  description: 'Explore artigos, guias e análises sobre o universo de Magic: The Gathering.',
};

export default async function BlogHubPage() {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles(username, avatar_url)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) {
    console.error("Erro ao buscar posts para o hub:", error);
  }

  return (
    <div>
      <header className="mb-12 border-b border-neutral-800 pb-6">
        <h1 className="text-5xl font-extrabold text-amber-500 tracking-tight">Hub de Conteúdo</h1>
        <p className="text-lg text-neutral-400 mt-2">Todos os nossos artigos, análises e guias para você.</p>
      </header>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral-500">Nenhum artigo publicado ainda.</p>
      )}
      
      {/* Futuramente, adicione a paginação aqui */}
    </div>
  );
}