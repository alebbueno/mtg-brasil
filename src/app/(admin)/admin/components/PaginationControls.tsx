/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client'

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

// AJUSTE: Adicionamos a prop 'basePath'
interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
  basePath: string; // Ex: '/blog' ou '/admin/users'
}

export default function PaginationControls({ totalPages, currentPage, basePath }: PaginationControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname(); // Usamos o pathname atual se basePath não for fornecido

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    // AJUSTE: Usa o basePath para construir o link corretamente
    return `${basePath}?${params.toString()}`;
  };

  // Não renderiza nada se houver apenas uma página ou menos
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-4 mt-8">
      <Button asChild variant="outline" size="icon" disabled={currentPage <= 1}>
        <Link href={createPageURL(currentPage - 1)} scroll={false}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      
      <span className="text-sm font-medium text-neutral-400">
        Página {currentPage} de {totalPages}
      </span>

      <Button asChild variant="outline" size="icon" disabled={currentPage >= totalPages}>
         <Link href={createPageURL(currentPage + 1)} scroll={false}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}