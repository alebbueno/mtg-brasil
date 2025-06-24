/* eslint-disable no-undef */
/* eslint-disable no-console */
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserActions from './components/UserActions';
import UserSearch from './components/UserSearch';
import UserPagination from './components/UserPagination';
import UserPointsDisplay from '@/app/(site)/components/ui/UserPointsDisplay';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: { query?: string; page?: string; }
}

export default async function AdminUsersPage(props: any) {
  const { searchParams } = props as PageProps;

  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  const supabase = createClient();
  const query = searchParams?.query || '';
  let currentPage = Number(searchParams?.page) || 1;
  currentPage = Math.max(1, currentPage);

  const USERS_PER_PAGE = 15;
  const offset = (currentPage - 1) * USERS_PER_PAGE;

  const { data: users, error } = await supabase.rpc('search_users_paginated', {
    search_term: query,
    page_size: USERS_PER_PAGE,
    page_offset: offset
  });

  if (error) {
    console.error("Erro ao buscar usuários:", error);
  }

  const { count: absoluteTotalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const filteredTotalUsers = users?.[0]?.total_count || 0;
  const totalPages = Math.ceil(filteredTotalUsers / USERS_PER_PAGE);

  currentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-amber-500">Gerenciar Usuários</h1>
            <Badge variant="secondary" className="text-base">{absoluteTotalUsers ?? 0} total</Badge>
          </div>
          <p className="text-neutral-400 mt-1">Visualize, filtre e gerencie todos os usuários cadastrados.</p>
        </div>
      </header>

      {/* Apenas a busca acima da tabela */}
      <UserSearch initialQuery={query} />

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg mt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700 hover:bg-neutral-900">
              <TableHead className="text-white w-[350px]">Usuário</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Pontos</TableHead>
              <TableHead className="text-white">Cargo</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Data de Cadastro</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user: any) => (
                <TableRow key={user.id} className="border-neutral-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Nome não definido'}</p>
                        <p className="text-sm text-neutral-400">@{user.username || 'username'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-300">{user.email}</TableCell>
                  <TableCell><UserPointsDisplay points={user.points} size="sm" /></TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.status === 'active' ? 'default' : 'outline'}
                      className={user.status === 'active'
                        ? 'border-green-500/50 bg-green-500/10 text-green-300'
                        : 'border-red-500/50 bg-red-500/10 text-red-300'}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActions user={user} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-neutral-500 py-10">
                  Nenhum usuário encontrado para esta busca.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação agora embaixo da tabela */}
      <UserPagination totalPages={totalPages} />
    </>
  );
}
