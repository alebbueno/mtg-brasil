import Header from '@/app/(site)/components/Header';
import Footer from '@/app/(site)/components/Footer';
// CORREÇÃO: Caminho do import ajustado
import { createClient } from '@/app/utils/supabase/server';
import type { User } from '@supabase/supabase-js';

type Profile = {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

// O tipo para as props do Header deve ser ajustado para receber userRole
interface HeaderProps {
  user: User | { email: string; user_metadata: Record<string, any>; } | null;
  profile: Profile;
  fallbackInitial: string;
  userRole: string;
}


export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single();
    profile = profileData;
  }

  const fallbackInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        user={user ? { email: user.email || '', user_metadata: user.user_metadata } : null}
        profile={profile || { full_name: '', avatar_url: '', role: 'user' }}
        fallbackInitial={fallbackInitial}
        userRole={profile?.role || 'user'}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}