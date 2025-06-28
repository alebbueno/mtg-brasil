/* eslint-disable no-console */
/* eslint-disable no-undef */
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import UserActions from './components/UserActions';
import UserControls from './components/UserControls';
import UserPointsDisplay from '@/app/(site)/components/ui/UserPointsDisplay';
import { Swords } from 'lucide-react'; // Importa um ícone para os decks

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
  const currentPage = Number(searchParams?.page) || 1;
  const USERS_PER_PAGE = 15;
  const offset = (currentPage - 1) * USERS_PER_PAGE;

  // A chamada RPC continua a mesma, mas agora a função retorna as contagens de deck
  const { data: users, error } = await supabase.rpc('search_users_paginated', {
    search_term: query,
    page_size: USERS_PER_PAGE,
    page_offset: offset
  });

  if (error) console.error("Erro ao buscar usuários:", error);

  const { count: absoluteTotalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const filteredTotalUsers = users?.[0]?.total_count || 0;
  const totalPages = Math.ceil(filteredTotalUsers / USERS_PER_PAGE);

  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-amber-500">Gerenciar Usuários</h1>
            <Badge variant="secondary" className="text-base">{absoluteTotalUsers ?? 0} total</Badge>
          </div>
          <p className="text-neutral-400 mt-1">Visualize, filtre e gerencie todos os usuários cadastrados na plataforma.</p>
        </div>
      </header>

      <UserControls initialQuery={query} totalPages={totalPages} currentPage={currentPage} />
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg mt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700 hover:bg-neutral-900">
              <TableHead className="text-white w-[350px]">Usuário</TableHead>
              <TableHead className="text-white">Decks (Públicos/Total)</TableHead>
              <TableHead className="text-white">Pontos</TableHead>
              <TableHead className="text-white">Cargo</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user: any) => (
                <TableRow key={user.id} className="border-neutral-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={user.avatar_url || ''} /><AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Nome não definido'}</p>
                        <p className="text-sm text-neutral-400">@{user.username || 'username'}</p>
                      </div>
                    </div>
                  </TableCell>
                  {/* ADIÇÃO: Célula com a contagem de decks */}
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium text-neutral-300">
                      <Swords size={16} className="text-neutral-500" />
                      <span>{user.public_decks} / {user.total_decks}</span>
                    </div>
                  </TableCell>
                  <TableCell><UserPointsDisplay points={user.points} size="sm" /></TableCell>
                  <TableCell><Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge></TableCell>
                  <TableCell><Badge variant={user.status === 'active' ? 'default' : 'outline'} className={user.status === 'active' ? 'border-green-500/50 bg-green-500/10 text-green-300' : 'border-red-500/50 bg-red-500/10 text-red-300'}>{user.status === 'active' ? 'Ativo' : 'Bloqueado'}</Badge></TableCell>
                  <TableCell className="text-right"><UserActions user={user} /></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={7} className="text-center text-neutral-500 py-10">Nenhum usuário encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}