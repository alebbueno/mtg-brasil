// app/my-deck/[format]/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';
import EditDeckForm from './EditDeckForm';

// Tipos locais
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

// Usamos `any` temporariamente para evitar conflito de tipagem na build
export default async function EditDeckPage({ params }: any) {
  const supabase = createClient();
  const { id } = params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: deck, error } = await supabase
    .from('decks')
    .select<"*", DeckData>("*")
    .eq('id', id)
    .single();

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

        <EditDeckForm deck={deck} />
      </div>
    </div>
  );
}
