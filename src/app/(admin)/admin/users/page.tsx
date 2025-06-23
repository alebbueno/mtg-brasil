/* eslint-disable no-console */
/* eslint-disable no-undef */
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export default async function AdminUsersPage() {
  // Segurança da página
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  // Busca os dados usando nossa nova função RPC
  const supabase = createClient();
  const { data: users, error } = await supabase.rpc('get_all_users_with_details');

  if (error) {
    console.error("Erro ao buscar usuários:", error);
  }

  return (
    <>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-amber-500">Gerenciar Usuários</h1>
        <p className="text-neutral-400 mt-1">
          Visualize e gerencie todos os usuários cadastrados na plataforma.
        </p>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700 hover:bg-neutral-900">
              <TableHead className="text-white w-[350px]">Usuário</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Cargo (Role)</TableHead>
              <TableHead className="text-white">Data de Cadastro</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} className="border-neutral-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.username || ''} />
                        <AvatarFallback>{user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Nome não definido'}</p>
                        <p className="text-sm text-neutral-400">@{user.username || 'username'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-neutral-300">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-400">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-neutral-500 py-10">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}