/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/admin/blog/page.tsx

import Link from 'next/link';
import { checkUserRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/(site)/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, ExternalLink } from 'lucide-react';

export default async function AdminBlogPage() {
  // 1. Segurança: Garante que apenas admins acessem esta página
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  // 2. Busca de Dados: Pega todos os posts para listar
  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, status, slug, created_at, profiles(username)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar posts:", error);
    // Você pode renderizar uma mensagem de erro aqui
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Cabeçalho da Página */}
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

        {/* Tabela de Posts */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-700">
                <TableHead className="text-white">Título</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Autor</TableHead>
                <TableHead className="text-white">Data</TableHead>
                <TableHead className="text-right text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id} className="border-neutral-800">
                    <TableCell className="font-medium">{post.title}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-400">@{post.profiles?.[0]?.username || 'N/A'}</TableCell>
                    <TableCell className="text-neutral-400">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                           <Button variant="outline" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                           </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.id}`}>
                           <Button variant="secondary" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                           </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-neutral-500 py-10">
                    Nenhum artigo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}