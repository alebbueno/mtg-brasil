'use client';

import { useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface UserPaginationProps {
  totalPages: number;
}

export default function UserPagination({ totalPages }: UserPaginationProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  let currentPage = Number(searchParams.get('page')) || 1;
  currentPage = Math.max(1, currentPage);
  currentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);

  const createPageURL = (pageNumber: number) => {
    const validPage = Math.max(1, Math.min(pageNumber, totalPages > 0 ? totalPages : 1));
    const params = new URLSearchParams(searchParams);
    params.set('page', validPage.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-4 mt-8">
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
