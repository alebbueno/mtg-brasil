import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProfileHeader from './components/ProfileHeader';
import DeckCard from '@/app/(site)/components/decks/DeckCard';
// import type { DeckFromDB } from '@/app/lib/types';

interface PageProps {
  params: {
    slug: string; // O parâmetro agora é genérico
  };
}

// Função para verificar se uma string é um UUID válido
const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// generateMetadata também precisa da mesma lógica para buscar os dados corretos
export async function generateMetadata(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();

  let profileQuery = supabase.from('profiles').select('username, full_name');
  
  if (isUUID(params.slug)) {
    profileQuery = profileQuery.eq('id', params.slug);
  } else {
    profileQuery = profileQuery.eq('username', params.slug);
  }

  const { data: profile } = await profileQuery.single();

  return {
    title: `${profile?.full_name || profile?.username || 'Usuário'} | Perfil no MTG Translate`,
    description: `Veja os decks e o perfil de ${profile?.full_name || profile?.username}.`,
  };
}


export default async function PublicProfilePage(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();

  // 1. Determina se estamos buscando por ID ou por username
  const isIdSearch = isUUID(params.slug);

  // 2. Monta a query dinamicamente
  let profileQuery = supabase.from('profiles').select('*');
  if (isIdSearch) {
    profileQuery = profileQuery.eq('id', params.slug);
  } else {
    profileQuery = profileQuery.eq('username', params.slug);
  }

  const { data: profile, error: profileError } = await profileQuery.single();

  // Se o perfil não for encontrado, mostra a página 404
  if (profileError || !profile) {
    notFound();
  }

  // 3. Busca os decks PÚBLICOS deste usuário usando o ID que encontramos
  const { data: decks } = await supabase
    .from('decks')
    .select('id, name, format, representative_card_image_url, color_identity')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('updated_at', { ascending: false });

  return (
    <div>
      <ProfileHeader profile={profile} />
      <main className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Decks Públicos</h2>
        {decks && decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-neutral-400">Este usuário ainda não publicou nenhum deck.</p>
          </div>
        )}
      </main>
    </div>
  );
}