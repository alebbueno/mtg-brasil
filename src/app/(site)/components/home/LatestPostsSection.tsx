import Link from 'next/link';
import PostCard from '../blog/PostCard'; // Importa nosso novo card
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function LatestPostsSection({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return null; // Não renderiza a seção se não houver posts
  }

  return (
    <section className="bg-neutral-950 py-16 sm:py-24">
      <div className="container mx-auto px-6">
        {/* Cabeçalho da Seção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-500 tracking-tight">
            Últimas do Nosso Blog
          </h2>
          <p className="mt-2 text-lg text-neutral-400 max-w-2xl mx-auto">
            Análises, guias de estratégia e as últimas novidades do universo de Magic: The Gathering.
          </p>
        </div>

        {/* Grid de Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {/* Botão de Call-to-Action (CTA) */}
        <div className="mt-12 text-center">
          <Link href="/blog">
            <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-600 font-bold">
              Ver Todos os Artigos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}