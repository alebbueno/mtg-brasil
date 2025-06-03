/* eslint-disable no-undef */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSubmitting(true);
      await router.push(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex gap-2 w-full max-w-sm sm:max-w-md">
      <Input
        type="text"
        placeholder="Nome, tipo, texto..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-neutral-800 border-neutral-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
      />
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <span>🔍</span>
        )}
      </Button>
    </form>
  );
}