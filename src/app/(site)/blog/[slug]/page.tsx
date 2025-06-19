/* eslint-disable no-console */
/* eslint-disable no-undef */
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DOMPurify from 'isomorphic-dompurify';
import styles from './PostStyles.module.scss';

// O tipo das props para referência interna, evitando o erro de build do Next.js
interface PageProps {
  params: {
    slug: string;
  };
}

// Tipagem para os dados que esperamos da nossa função RPC
type PostData = {
  id: string; 
  title: string; 
  content: string; 
  excerpt: string | null;
  cover_image_url: string | null; 
  published_at: string;
  username: string | null; 
  full_name: string | null; 
  avatar_url: string | null;
  categories: { slug: string; name: string }[] | null;
}

/**
 * Gera os metadados de SEO (título, descrição, etc.) para a página.
 * Roda no servidor antes da página ser renderizada.
 */
export async function generateMetadata(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();
  
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, meta_title, meta_description, cover_image_url')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return { title: 'Post Não Encontrado' };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630 }] : [],
    },
  };
}

/**
 * O componente principal da página do artigo.
 */
export default async function PostPage(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();

  // 1. Chama a função RPC para buscar todos os dados do post de forma otimizada
  const { data: post, error } = await supabase
    .rpc('get_published_post_details', { p_slug: params.slug })
    .single<PostData>();

  if (error || !post) {
    notFound();
  }

  // 2. Incrementa a contagem de visualizações sem bloquear a renderização da página
  supabase.rpc('increment_post_view', { post_slug: params.slug }).then(({ error }) => {
    if(error) console.error(`Falha ao incrementar view para ${params.slug}:`, error.message);
  });
  
  // 3. Limpa o HTML do conteúdo para renderização segura
  const cleanContent = post.content ? DOMPurify.sanitize(post.content) : '';

  return (
    <>
      {/* Seção de Herói com imagem de capa, título e metadados */}
      <header className="relative h-[60vh] min-h-[450px] w-full flex flex-col items-center justify-center text-center text-white p-4">
        {post.cover_image_url && (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"></div>
        
        <div className="relative z-10 max-w-4xl">
           <div className="flex justify-center items-center flex-wrap gap-2 mb-4">
            {post.categories?.map((cat) => (
              <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
                <Badge variant="outline" className="border-white/20 bg-black/20 text-white backdrop-blur-sm hover:bg-white/20 transition-colors">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
            {post.title}
          </h1>
           <div className="mt-6 flex items-center justify-center gap-4 text-base text-neutral-200">
              <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                      <AvatarImage src={post.avatar_url || ''} />
                      <AvatarFallback>{post.full_name?.charAt(0).toUpperCase() || post.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">por {post.full_name || post.username}</span>
              </div>
              <span className="text-neutral-500">•</span>
              <span>{new Date(post.published_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </header>

      {/* Seção do Conteúdo do Artigo */}
      <main className="w-full bg-neutral-950 flex justify-center">
        <article className={styles.articleContent}>
          <div
            className="prose prose-invert prose-lg max-w-4xl py-16 px-4"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </article>
      </main>
    </>
  );
}