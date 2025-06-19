import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// AJUSTE: A tipagem agora reflete a estrutura de dados "plana" que vem da nossa nova função
type PostCardProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string | null;
    username: string | null;      // Não está mais aninhado
    avatar_url: string | null;    // Não está mais aninhado
  };
};

export default function PostCard({ post }: PostCardProps) {
  const authorName = post.username || 'Anônimo';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full">
      <Card className="bg-neutral-900 border-neutral-800 h-full flex flex-col hover:border-amber-500/50 transition-all duration-300">
        <CardHeader className="p-0">
          <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
            {post.cover_image_url ? (
              <Image
                src={post.cover_image_url}
                alt={`Capa do post: ${post.title}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center">
                <span className="font-bold text-amber-500/50 text-2xl">MTG</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <h3 className="text-xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-neutral-400 mt-2 line-clamp-3">
            {post.excerpt}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-neutral-500">
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    {/* AJUSTE: Acessando a URL do avatar diretamente */}
                    <AvatarImage src={post.avatar_url || ''} />
                    <AvatarFallback>{authorInitial}</AvatarFallback>
                </Avatar>
                {/* AJUSTE: Acessando o nome de usuário diretamente */}
                <span>{authorName}</span>
            </div>
            {post.published_at && (
                <span>{new Date(post.published_at).toLocaleDateString('pt-BR')}</span>
            )}
        </CardFooter>
      </Card>
    </Link>
  );
}