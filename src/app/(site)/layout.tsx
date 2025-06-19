/* eslint-disable no-undef */
// app/(site)/layout.tsx (O layout do site público)

import Header from '@/app/(site)/components/Header'; // Adapte o caminho se necessário
import Footer from '@/app/(site)/components/Footer'; // Adapte o caminho se necessário
import { createClient } from '@/app/(site)/utils/supabase/server';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // A busca de dados do usuário para o Header acontece aqui
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ... sua lógica para buscar o profile ...
  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role') // Buscando o role aqui
      .eq('id', user.id)
      .single();
    profile = profileData;
  }
  const fallbackInitial = user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?';

  return (
    // Este layout tem Header e Footer
    <div className="flex flex-col min-h-screen">
      <Header 
        user={user ? { email: user.email || '', user_metadata: user.user_metadata } : null}
        profile={profile || { full_name: '', avatar_url: '' }}
        fallbackInitial={fallbackInitial}
        userRole={profile?.role || 'user'} // Passando o role para o header
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}