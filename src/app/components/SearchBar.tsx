'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Buscar sugestões quando a query mudar
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    async function fetchSuggestions() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        if (!response.ok) {
          throw new Error('Erro ao buscar sugestões');
        }
        const { suggestions } = await response.json();
        setSuggestions(suggestions || []);
        setIsOpen(true);
      } catch (error) {
        // eslint-disable-next-line no-undef, no-console
        console.error('Erro no autocomplete:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();
  }, [debouncedQuery]);

  // Lidar com a submissão do formulário
  // eslint-disable-next-line no-undef
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSubmitting(true);
      setIsOpen(false);
      await router.push(`/card/${encodeURIComponent(query)}`);
      setQuery('');
      setIsSubmitting(false);
    }
  };

  // Lidar com a seleção de uma sugestão
  const handleSelect = async (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    setIsSubmitting(true);
    await router.push(`/card/${encodeURIComponent(suggestion)}`);
    setQuery('');
    setIsSubmitting(false);
    inputRef.current?.blur();
  };

  // Lidar com navegação por teclado
  // eslint-disable-next-line no-undef
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex gap-2 w-full max-w-md">
      <div className="relative w-full">
        <Command className="bg-neutral-800 border py-2 border-neutral-700 rounded-lg overflow-visible">
          <CommandInput
            ref={inputRef}
            placeholder="Nome da carta"
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleKeyDown}
            className="bg-neutral-800 border-none p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {isOpen && (
            <CommandList className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
              {isLoading ? (
                <div className="p-2 space-y-2">
                  <Skeleton className="h-8 bg-neutral-700" />
                  <Skeleton className="h-8 bg-neutral-700" />
                  <Skeleton className="h-8 bg-neutral-700" />
                </div>
              ) : suggestions.length === 0 && debouncedQuery.length >= 2 ? (
                <CommandEmpty>Nenhuma carta encontrada</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion}
                      value={suggestion}
                      onSelect={() => handleSelect(suggestion)}
                      className="px-3 py-2 text-white border-0 hover:bg-amber-500 hover:text-black cursor-pointer"
                    >
                      {suggestion}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      </div>
      <Button
        type="submit"
         size="lg"
        disabled={isSubmitting}
        className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <>
            <span>🔍</span> Buscar
          </>
        )}
      </Button>
    </form>
  );
}