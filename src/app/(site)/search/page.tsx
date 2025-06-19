import React, { Suspense } from 'react';
import SearchClientContent from './components/SearchClientContent'; // Ajuste o caminho se necessário
import { Skeleton } from '@/components/ui/skeleton'; // Para o fallback
import { Card, CardContent } from '@/components/ui/card'; // Para o fallback

// Componente de fallback para o Suspense
function LoadingSearchResults() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          {/* Skeleton para o título e filtros */}
          <Skeleton className="h-9 w-1/2 bg-neutral-700" />
          <Skeleton className="h-10 w-24 bg-neutral-700" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="bg-neutral-800 border-neutral-700">
              <CardContent className="p-2">
                <Skeleton className="h-[300px] sm:h-[350px] w-full rounded-md bg-neutral-700" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded bg-neutral-700" />
                  <Skeleton className="h-3 w-1/2 rounded bg-neutral-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPageContainer() {
  // Esta página agora é um Server Component.
  // Ela não usa 'useSearchParams' diretamente.
  // A lógica do cliente foi movida para SearchClientContent.

  return (
    <Suspense fallback={<LoadingSearchResults />}>
      <SearchClientContent />
    </Suspense>
  );
}