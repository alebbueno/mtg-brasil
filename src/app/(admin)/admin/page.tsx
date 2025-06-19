// app/(admin)/admin/page.tsx

import { createClient } from '@/app/(site)/utils/supabase/server';
import { Users, FileText, Bookmark, MessageSquare } from 'lucide-react';
import StatCard from './components/StatCard';
import RecentDecks from './components/RecentDecks';
import UsersChart from './components/UsersChart';
import RecentPosts from './components/RecentPosts';

export default async function AdminPage() {
  // A segurança agora é centralizada no layout, mas manter aqui é uma boa prática (defesa em profundidade).
  // Para simplificar, vamos assumir que o layout já nos protegeu.

  const supabase = createClient();
  
  // As buscas de dados continuam as mesmas
  const userCountPromise = supabase.from('profiles').select('*', { count: 'exact', head: true });
  const deckCountPromise = supabase.from('decks').select('*', { count: 'exact', head: true });
  const savedDecksCountPromise = supabase.from('saved_decks').select('*', { count: 'exact', head: true });
  const postsCountPromise = supabase.from('posts').select('*', { count: 'exact', head: true });
  const recentPostsPromise = supabase
    .from('posts')
    .select('id, title, slug, status, profiles(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(5)
    .then(({ data }) => data?.map(post => ({
      ...post,
      profiles: post.profiles[0]
    })));
  const recentDecksPromise = supabase
    .from('decks')
    .select('id, name, format, profiles!inner(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(5)
    .then(({ data }) => data?.map(deck => ({
      ...deck,
      profiles: deck.profiles[0]
    })));
  const usersByDayPromise = supabase.rpc('get_new_users_per_day');

  const [
    { count: userCount }, { count: deckCount }, { count: savedDecksCount },
    { count: postsCount }, recentPosts, recentDecks,
    { data: usersByDayData }
  ] = await Promise.all([
    userCountPromise, deckCountPromise, savedDecksCountPromise,
    postsCountPromise, recentPostsPromise, recentDecksPromise, usersByDayPromise
  ]);

  const chartData = (usersByDayData || []).map((row: any) => ({
    date: new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric' }).format(new Date(row.day)),
    total: row.count,
  })).reverse();

  // O JSX agora não precisa mais do contêiner principal com min-h-screen
  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-amber-500 tracking-tight">
          Dashboard
        </h1>
        <p className="text-lg text-neutral-400 mt-2">
          Visão geral e métricas da plataforma.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total de Usuários" value={userCount ?? 0} description="Usuários cadastrados" Icon={Users} />
          <StatCard title="Total de Decks" value={deckCount ?? 0} description="Decks criados pela comunidade" Icon={FileText} />
          <StatCard title="Total de Artigos" value={postsCount ?? 0} description="Posts criados no blog" Icon={MessageSquare} />
          <StatCard title="Decks Salvos" value={savedDecksCount ?? 0} description="Interações de 'salvar' em decks" Icon={Bookmark} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
              <UsersChart data={chartData} />
          </div>
          <div className="lg:col-span-2 space-y-6">
              <RecentDecks decks={recentDecks || []} />
              <RecentPosts posts={recentPosts || []} />
          </div>
      </div>
    </>
  );
}