/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const commandRef = useRef<HTMLDivElement>(null);

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
        if (!response.ok) throw new Error('Erro ao buscar sugestões');
        const { suggestions } = await response.json();
        setSuggestions(suggestions || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Erro no autocomplete:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggestions();
  }, [debouncedQuery]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSelect = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    router.push(`/card/${encodeURIComponent(suggestion)}`);
    if (commandRef.current) {
      (commandRef.current.querySelector('input') as HTMLInputElement)?.blur();
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <Command 
        ref={commandRef}
        className="relative bg-black/30 border border-neutral-700 rounded-[100px] shadow-lg overflow-visible
                   backdrop-blur-sm transition-all duration-300
                   focus-within:border-amber-500/80 focus-within:shadow-[0_0_30px_0px_rgba(245,158,11,0.3)]"
      >
        {/* AJUSTE: O CommandInput agora está dentro de uma div com flex-1 para garantir que ele se expanda */}
        <div className="flex items-center px-5 py-[20px]">
          <Search className="h-5 w-5 text-neutral-400 shrink-0" />
          <div className="flex-1">
            <CommandInput
              placeholder="Digite o nome de uma carta de Magic..."
              value={query}
              onValueChange={setQuery}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              onFocus={() => query.length > 1 && setIsOpen(true)}
              className="w-full h-16 pl-3 bg-transparent border-0 text-lg text-white
                         selection:bg-amber-500/50 placeholder:text-neutral-500
                         focus:ring-0"
            />
          </div>
        </div>
        
        {isOpen && (
          <CommandList 
            className="absolute top-full left-0 right-0 mt-2 bg-neutral-900/90 border border-neutral-700 
                       rounded-xl shadow-2xl backdrop-blur-md max-h-60 overflow-y-auto z-20
                       animate-in fade-in-0 zoom-in-95"
          >
            {isLoading ? (
              <div className="p-2 space-y-2">
                <Skeleton className="h-9 w-full bg-neutral-700/80" />
                <Skeleton className="h-9 w-full bg-neutral-700/80" />
                <Skeleton className="h-9 w-full bg-neutral-700/80" />
              </div>
            ) : (
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                    className="px-4 py-2.5 text-base text-white border-0 
                               aria-selected:bg-amber-500 aria-selected:text-black 
                               cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {suggestions.length === 0 && debouncedQuery.length > 1 && !isLoading && (
                <CommandEmpty>Nenhuma carta encontrada para &quot;{debouncedQuery}&quot;</CommandEmpty>
            )}
          </CommandList>
        )}
      </Command>
    </form>
  );
}