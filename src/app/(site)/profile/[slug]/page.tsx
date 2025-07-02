import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProfileHeader from './components/ProfileHeader';
import DeckCardItemShared from './components/DeckCard';
import ProfileDeckFilters from './components/ProfileDeckFilters';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string; };
  searchParams?: { format?: string; };
}

const isUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export async function generateMetadata(props: any) {
  const { params } = props as PageProps;
  const supabase = createClient();

  let profileQuery = supabase.from('profiles').select('username, full_name, id');
  profileQuery = isUUID(params.slug)
    ? profileQuery.eq('id', params.slug)
    : profileQuery.eq('username', params.slug);

  const { data: profile } = await profileQuery.single();

  return {
    title: `${profile?.full_name || profile?.username || 'Usuário'} | Perfil no DeckSage`,
    description: `Veja os decks e o perfil de ${profile?.full_name || profile?.username}.`,
  };
}

export default async function PublicProfilePage(props: any) {
  const { params, searchParams } = props as PageProps;
  const supabase = createClient();

  let profileQuery = supabase.from('profiles').select('*');
  profileQuery = isUUID(params.slug)
    ? profileQuery.eq('id', params.slug)
    : profileQuery.eq('username', params.slug);

  const { data: profile, error: profileError } = await profileQuery.single();
  if (profileError || !profile) return notFound();

  const { data: allDecks } = await supabase
    .from('decks')
    .select('format')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .eq('owner_type', 'user');

  const availableFormats = allDecks ? [...new Set(allDecks.map(d => d.format))] : [];
  const formatFilter = searchParams?.format?.toLowerCase() || null;

  let decksQuery = supabase
    .from('decks')
    .select('id, name, format, representative_card_image_url, color_identity, created_at, view_count, save_count, clone_count')
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .eq('owner_type', 'user');

  if (formatFilter) {
    decksQuery = decksQuery.eq('format', formatFilter);
  }

  const { data: decks } = await decksQuery.order('updated_at', { ascending: false });

  return (
    <div>
      <ProfileHeader profile={profile} />
      <main className="container mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Decks Públicos</h2>

        <ProfileDeckFilters
          availableFormats={availableFormats}
          activeFormat={formatFilter}
          slug={params.slug}
        />

        {decks && decks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {decks.map((deck) => (
              <DeckCardItemShared
                key={deck.id}
                deck={deck}
                creatorUsername={profile.username}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-neutral-900 rounded-lg border border-neutral-800">
            <p className="text-neutral-400">
              {formatFilter
                ? `Este usuário não publicou nenhum deck do formato ${formatFilter}.`
                : 'Este usuário ainda não publicou nenhum deck.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
