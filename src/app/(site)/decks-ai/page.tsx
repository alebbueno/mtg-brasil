/* eslint-disable no-undef */
/* eslint-disable no-console */
import { createClient } from '@/app/utils/supabase/server';
import DeckFilters from './components/DeckFilters';
import DeckCard from './components/DeckCard';
import PaginationControls from './components/PaginationControls';

export const metadata = {
    title: 'Biblioteca de Decks | MTG Deck Builder',
    description: 'Explore decks de Magic: The Gathering para diversos formatos, criados e analisados pela nossa comunidade e equipe.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: { format?: string; page?: string; }
}

export default async function DecksPage(props: any) {
  const { searchParams } = props as PageProps;
  const supabase = createClient();

  const formatFilter = searchParams?.format || '';
  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 12;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const { data: decks, error } = await supabase.rpc('search_public_site_decks', {
    format_filter: formatFilter,
    page_size: ITEMS_PER_PAGE,
    page_offset: offset
  });

  if (error) {
    console.error("Erro ao buscar decks do site:", error);
  }

  const totalItems = decks?.[0]?.total_count || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container mx-auto px-6 py-12">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-amber-500 tracking-tight">Biblioteca de Decks</h1>
          <p className="text-lg text-neutral-400 mt-2 max-w-2xl mx-auto">
            Explore dezenas de decks para todos os formatos, completos com análise e guia de como jogar.
          </p>
        </header>

        <DeckFilters />

        {decks && decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck: any) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-neutral-400">Nenhum deck encontrado para este formato.</p>
          </div>
        )}
        
        <PaginationControls
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}