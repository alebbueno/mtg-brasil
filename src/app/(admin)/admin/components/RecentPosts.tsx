'use client'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Tipagem para os dados que este componente espera
type RecentPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export default function RecentPosts({ posts }: { posts: RecentPost[] }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle>Artigos Recentes</CardTitle>
        <CardDescription>Os últimos 5 artigos criados ou atualizados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length > 0 ? posts.map(post => (
          <div key={post.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={post.profiles?.avatar_url || ''} />
                <AvatarFallback>{post.profiles?.username?.charAt(0).toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/admin/blog/edit/${post.id}`} className="font-semibold text-neutral-100 hover:text-amber-400 transition-colors line-clamp-1">{post.title}</Link>
                <p className="text-xs text-neutral-400">por @{post.profiles?.username || 'anônimo'}</p>
              </div>
            </div>
            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
              {post.status === 'published' ? 'Publicado' : 'Rascunho'}
            </Badge>
          </div>
        )) : (
          <p className="text-sm text-center text-neutral-500 py-4">Nenhum artigo ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}