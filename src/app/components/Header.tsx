import Link from 'next/link';
import GlobalSearch from './GlobalSearch';
import UserMenu from './UserMenu';
import { createClient } from '@/app/utils/supabase/server';

export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Objeto para guardar os dados do perfil
  let profile = null;
  
  // Se houver um utilizador, busca os dados da tabela 'profiles'
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single();
    
    profile = profileData;
  }

  const fallbackInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';

  return (
    <header className="w-full p-4 bg-gradient-to-r from-black via-neutral-900 to-black shadow-lg sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-amber-400 hover:text-amber-500 transition-colors">
          🧙 MTG Translate
        </Link>
        
        <div className="flex-1 px-4 lg:px-8">
          <GlobalSearch />
        </div>

        {user?.email}

        <UserMenu 
          user={user ? {
            email: user.email || '',
            user_metadata: user.user_metadata
          } : null} 
          fallbackInitial={fallbackInitial} 
          profile={profile || { full_name: '', avatar_url: '' }} 
        />
      </div>
    </header>
  );
}