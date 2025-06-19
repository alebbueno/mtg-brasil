// app/admin/page.tsx

import { checkUserRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server';

// Componentes do Shadcn UI e Lucide Icons
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, FileText, BarChart2 } from 'lucide-react';

export default async function AdminPage() {
  // 1. BARREIRA DE SEGURANÇA
  // Esta verificação é a primeira coisa que a página faz.
  const isAdmin = await checkUserRole('admin');

  // Se o usuário não for admin, a função notFound() é chamada,
  // renderizando uma página 404 e escondendo todo o conteúdo abaixo.
  if (!isAdmin) {
    notFound();
  }

  // 2. BUSCA DOS DADOS (só executa se o usuário for admin)
  const supabase = createClient();
  
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: deckCount } = await supabase
    .from('decks')
    .select('*', { count: 'exact', head: true });


  // 3. RENDERIZAÇÃO DO PAINEL
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8">
      <div className="max-w-screen-xl mx-auto">
        <header className="mb-10 border-b border-neutral-800 pb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-500 tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-lg text-neutral-400 mt-2">
            Métricas e visão geral da plataforma MTG Translate.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-neutral-900 border-neutral-800 hover:border-amber-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">Total de Usuários</CardTitle>
              <Users className="h-5 w-5 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userCount ?? '0'}</div>
              <p className="text-xs text-neutral-500 mt-1">Usuários cadastrados na plataforma.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-neutral-900 border-neutral-800 hover:border-amber-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">Total de Decks</CardTitle>
              <FileText className="h-5 w-5 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{deckCount ?? '0'}</div>
              <p className="text-xs text-neutral-500 mt-1">Decks criados pela comunidade.</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800 hover:border-amber-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-300">Métrica Futura</CardTitle>
              <BarChart2 className="h-5 w-5 text-neutral-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">...</div>
              <p className="text-xs text-neutral-500 mt-1">Ex: Cartas mais usadas.</p>
            </CardContent>
          </Card>

        </section>
      </div>
    </div>
  );
}