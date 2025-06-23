/* eslint-disable no-console */
/* eslint-disable no-undef */
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

// Reutilizaremos o componente de busca dos usuários
import UserSearch from '../users/components/UserSearch';
// E o de paginação
import PaginationControls from '@/app/(admin)/admin/components/PaginationControls';

const statusStyles: Record<string, string> = {
    'new': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'in_analysis': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'completed': 'bg-green-500/20 text-green-300 border-green-500/30',
    'unnecessary': 'bg-neutral-700/20 text-neutral-400 border-neutral-700/30',
}

export default async function AdminFeedbackPage({ searchParams }: {
  searchParams?: { query?: string; page?: string; }
}) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  const supabase = createClient();
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 15;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data: feedbacks, error } = await supabase.rpc('search_feedback_paginated', {
    search_term: query,
    page_size: ITEMS_PER_PAGE,
    page_offset: offset
  });

  if (error) console.error("Erro ao buscar feedbacks:", error);

  const totalItems = feedbacks?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-amber-500">Caixa de Feedback</h1>
        <p className="text-neutral-400 mt-1">
          Analise o que os usuários estão dizendo sobre a plataforma.
        </p>
      </header>

      <div className="mb-6 max-w-sm">
        <UserSearch placeholder="Buscar por conteúdo ou email..." />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700 hover:bg-neutral-900">
              <TableHead className="text-white">Feedback</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Usuário</TableHead>
              <TableHead className="text-white">Data</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedbacks && feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <TableRow key={fb.id} className="border-neutral-800">
                  <TableCell className="max-w-sm">
                    <p className="truncate text-neutral-300">{fb.content}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[fb.status] || ''}>{fb.status}</Badge>
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    {fb.username ? `@${fb.username}` : (fb.email || 'Anônimo')}
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    {new Date(fb.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/feedback/${fb.id}`}>
                        <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" /> Ver
                        </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center text-neutral-500 py-10">Nenhum feedback encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-6">
        <PaginationControls totalPages={totalPages} currentPage={currentPage} basePath="/admin/feedback" />
      </div>
    </>
  );
}