import { createClient } from '@/app/utils/supabase/server';
import { Users, FileText, Eye } from 'lucide-react';
import StatCard from './components/StatCard';
import UsersChart from './components/UsersChart';
import TopPages from './components/TopPages'; // Importa o novo componente
import { getAnalyticsSummary } from '@/app/actions/admin/analyticsActions'; // Importa a nova action

export default async function AdminPage() {
  const supabase = createClient();
  
  // Vamos buscar os dados do Supabase e do Google Analytics em paralelo
  const [
    { count: userCount }, 
    { count: deckCount },
    { data: usersByDayData },
    analyticsData
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('decks').select('*', { count: 'exact', head: true }),
    supabase.rpc('get_new_users_per_day'),
    getAnalyticsSummary() // Chama nossa nova action do Google Analytics
  ]);

  const chartData = (usersByDayData || []).map((row: any) => ({
    date: new Intl.DateTimeFormat('pt-BR', { month: 'short', day: 'numeric' }).format(new Date(row.day)),
    total: row.count,
  })).reverse();

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
      
      {/* Se houver um erro no Analytics, mostra um aviso */}
      {analyticsData.error && (
         <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            <p><strong>Erro ao carregar dados do Analytics:</strong> {analyticsData.error}</p>
            <p className="text-sm mt-2">Verifique se suas variáveis de ambiente e permissões no Google estão corretas.</p>
        </div>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total de Usuários" value={userCount ?? 0} description="Usuários cadastrados" Icon={Users} />
          <StatCard title="Total de Decks" value={deckCount ?? 0} description="Decks criados na plataforma" Icon={FileText} />
          {/* AJUSTE: Cards agora mostram os dados do Analytics */}
          <StatCard title="Usuários Ativos (7d)" value={analyticsData.totalUsers ?? '0'} description="Visitantes nos últimos 7 dias" Icon={Users} />
          <StatCard title="Page Views (7d)" value={analyticsData.totalPageViews ?? '0'} description="Visualizações de página" Icon={Eye} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
              <UsersChart data={chartData} />
          </div>
          <div className="lg:col-span-2">
              {/* AJUSTE: Adicionamos o card de Páginas Mais Vistas */}
              <TopPages pages={analyticsData.topPages || []} />
          </div>
      </div>
    </>
  );
}