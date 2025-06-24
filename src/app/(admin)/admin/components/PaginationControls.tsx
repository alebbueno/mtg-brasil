/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
  basePath: string;
}

export default function PaginationControls({ totalPages, currentPage, basePath }: PaginationControlsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createPageURL = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(pageNumber, totalPages > 0 ? totalPages : 1));
    const params = new URLSearchParams(searchParams);
    params.set('page', validPage.toString());
    return `${basePath}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-4">
      <Button asChild variant="outline" size="icon" disabled={currentPage <= 1}>
        <Link href={createPageURL(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      <span className="text-sm font-medium text-neutral-400">
        Página {currentPage} de {totalPages}
      </span>

      <Button asChild variant="outline" size="icon" disabled={currentPage >= totalPages}>
        <Link href={createPageURL(currentPage + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}
