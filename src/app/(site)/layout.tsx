/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import Header from '@/app/(site)/components/Header';
import Footer from '@/app/(site)/components/Footer';
import { createClient } from '@/app/utils/supabase/server';
import FloatingFeedback from './components/FloatingFeedback';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role, referral_code, points')
      .eq('id', user.id)
      .single();
    profile = profileData;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingFeedback user={user} />
    </div>
  );
}
