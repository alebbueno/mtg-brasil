'use client'

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
}

export default function PaginationControls({ totalPages, currentPage }: PaginationControlsProps) {
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `/blog?${params.toString()}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-4 mt-16">
      <Link href={createPageURL(currentPage - 1)} passHref>
        <Button variant="outline" size="icon" disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>
      
      <span className="text-sm font-medium">
        Página {currentPage} de {totalPages}
      </span>

      <Link href={createPageURL(currentPage + 1)} passHref>
        <Button variant="outline" size="icon" disabled={currentPage >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </nav>
  );
}