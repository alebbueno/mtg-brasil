/* eslint-disable no-console */
/* eslint-disable no-undef */
'use server'

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { checkUserRole } from '@/lib/auth';

/**
 * Busca um resumo de dados do Google Analytics de forma segura e robusta.
 */
export async function getAnalyticsSummary() {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) return { error: "Acesso negado." };

  const propertyId = process.env.GA_PROPERTY_ID;

  if (!propertyId || !process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY) {
      return { error: 'As credenciais do Google Analytics não estão configuradas no servidor.'}
  }

  // A inicialização do cliente agora fica dentro da função para ser mais segura
  const analyticsClient = new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA_CLIENT_EMAIL,
      private_key: process.env.GA_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
  });

  try {
    // Usamos Promise.all para fazer as duas chamadas à API em paralelo
    const [totalsResponse, pagesResponse] = await Promise.all([
      // Chamada 1: Apenas métricas, para obter os totais gerais
      analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      }),
      // Chamada 2: Métricas e dimensões, para obter as páginas mais vistas
      analyticsClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
        dimensions: [{ name: 'pagePath' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 5,
      })
    ]);

    // Extrai os dados da primeira resposta (Totais)
    // Quando não há dimensões, o Google retorna os totais na primeira linha de 'rows'
    const totalUsers = totalsResponse[0]?.rows?.[0]?.metricValues?.[0]?.value ?? '0';
    const totalPageViews = totalsResponse[0]?.rows?.[0]?.metricValues?.[1]?.value ?? '0';

    // Extrai os dados da segunda resposta (Top Páginas)
    const topPages = pagesResponse[0]?.rows?.map(row => ({
      path: row?.dimensionValues?.[0]?.value,
      views: row?.metricValues?.[1]?.value,
    })) || [];
    
    return { 
      success: true, 
      totalUsers, 
      totalPageViews, 
      topPages 
    };

  } catch (error: any) {
    console.error('Erro na API do Google Analytics:', error.details || error.message);
    return { error: `Falha na API do Google: ${error.details || 'Verifique as permissões.'}` };
  }
}