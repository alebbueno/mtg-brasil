import Image from 'next/image';
import Link from 'next/link';
// import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export default function FeaturedPostCard({ post }: { post: any }) {
  return (
    <div className="group grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center mb-12">
      <Link href={`/blog/${post.slug}`} className="relative w-full aspect-video overflow-hidden rounded-xl shadow-lg">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={`Capa do post: ${post.title}`}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center">
            <span className="font-bold text-amber-500/50 text-2xl">MTG</span>
          </div>
        )}
      </Link>
      
      <div className="flex flex-col">
        <p className="text-sm font-semibold text-amber-500 uppercase tracking-wider">Artigo em Destaque</p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-neutral-100 line-clamp-3 group-hover:text-amber-400 transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="mt-4 text-base text-neutral-400 line-clamp-3">
          {post.excerpt}
        </p>
        <Link href={`/blog/${post.slug}`} className="mt-6">
          <div className="inline-flex items-center font-bold text-amber-400 group-hover:text-white transition-colors">
            Ler Artigo
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}