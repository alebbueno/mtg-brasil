/* eslint-disable no-console */
/* eslint-disable no-undef */
import Link from 'next/link';
import { checkUserRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
// CORREÇÃO: Caminho do import ajustado
import { createClient } from '@/app/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, ExternalLink } from 'lucide-react';

export default async function AdminBlogPage() {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, status, slug, created_at, profiles(username)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar posts:", error);
  }

  return (
    <>
      <header className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">Gerenciar Artigos</h1>
          <p className="text-neutral-400 mt-1">Crie, edite e gerencie os posts do seu blog.</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Post
          </Button>
        </Link>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700 hover:bg-neutral-900">
              <TableHead className="text-white">Título</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Autor</TableHead>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <TableRow key={post.id} className="border-neutral-800">
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                      {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    @{ (Array.isArray(post.profiles) ? post.profiles[0]?.username : post.profiles?.username) || 'N/A' }
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/blog/${post.slug}`} target="_blank" title="Ver post no site">
                         <Button variant="outline" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                      </Link>
                      <Link href={`/admin/blog/edit/${post.id}`} title="Editar post">
                         <Button variant="secondary" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-neutral-500 py-10">
                  Nenhum artigo encontrado. Clique em &ldquo;Criar Novo Post&rdquo; para começar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}