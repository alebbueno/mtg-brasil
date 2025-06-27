/* eslint-disable no-console */
/* eslint-disable no-undef */
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import UserControls from '../users/components/UserControls';
import ManaCost from '@/components/ui/ManaCost';
// AJUSTE: Importamos nosso novo componente de ações
import DeckActions from './components/DeckActions';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: { query?: string; page?: string; }
}

export default async function AdminSiteDecksPage(props: any) {
  const { searchParams } = props as PageProps;
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  const supabase = createClient();
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 20;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data: decks, error } = await supabase.rpc('search_site_decks_paginated', {
    search_term: query,
    page_size: ITEMS_PER_PAGE,
    page_offset: offset
  });

  if (error) console.error("Erro ao buscar decks do site:", error);

  const totalItems = decks?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">Decks do Site</h1>
          <p className="text-neutral-400 mt-1">Gerencie todos os decks criados para serem exibidos no site.</p>
        </div>
        <div className="flex gap-2">
            <Link href="/admin/decks/new"><Button variant="secondary"><PlusCircle className="mr-2 h-4 w-4" /> Criar Manual</Button></Link>
            <Link href="/admin/ai-generator"><Button><PlusCircle className="mr-2 h-4 w-4" /> Gerar com IA</Button></Link>
        </div>
      </header>

      <div className="max-w-md"><UserControls initialQuery={query} totalPages={totalPages}/></div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg mt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700">
              <TableHead className="text-white">Nome do Deck</TableHead>
              <TableHead>Formato</TableHead>
              <TableHead>Cores</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {decks && decks.length > 0 ? (
              decks.map((deck: any) => (
                <TableRow key={deck.id} className="border-neutral-800">
                  <TableCell className="font-medium text-white">{deck.name}</TableCell>
                  <TableCell><Badge variant="outline">{deck.format}</Badge></TableCell>
                  <TableCell><div className="flex gap-1">{deck.color_identity.map((c: string) => (<ManaCost key={c} cost={`{${c}}`} />))}</div></TableCell>
                  <TableCell>{new Date(deck.created_at).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    {/* AJUSTE: Usamos o novo componente de ações */}
                    <DeckActions deck={deck} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center text-neutral-500 py-10">Nenhum deck encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}