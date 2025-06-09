// app/my-deck/[format]/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import EditDeckForm from './EditDeckForm'; // Componente de cliente para o formulário

// Tipos para os dados do deck
interface DeckCard {
  count: number;
  name: string;
}
interface Decklist {
  mainboard: DeckCard[];
  sideboard?: DeckCard[];
}
interface DeckData {
  id: string;
  user_id: string;
  name: string;
  format: string;
  description: string | null;
  decklist: Decklist;
  is_public: boolean;
}

export default async function EditDeckPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = params;

  // Busca os dados do utilizador e do deck
  const { data: { user } } = await supabase.auth.getUser();
  const { data: deck, error } = await supabase
    .from('decks')
    .select<"*", DeckData>("*")
    .eq('id', id)
    .single();

  // Se o deck não for encontrado ou o utilizador não for o dono, mostra 404
  if (error || !deck || user?.id !== deck.user_id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-400">
            Editar Deck
          </h1>
          <p className="text-lg text-neutral-300 mt-2">
            Ajuste a sua estratégia e refina a sua lista.
          </p>
        </header>
        
        {/* Passa os dados do deck para o formulário no lado do cliente */}
        <EditDeckForm deck={deck} />
      </div>
    </div>
  );
}
