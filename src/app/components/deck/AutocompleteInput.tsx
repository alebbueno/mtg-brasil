/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// app/components/deck/AutocompleteInput.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { searchScryfallCards } from '@/app/lib/scryfall';
import type { ScryfallCard } from '@/app/lib/scryfall';

interface AutocompleteInputProps {
  onSelect: (card: ScryfallCard | null) => void;
  placeholder?: string;
  onClear?: () => void;
}

export default function AutocompleteInput({ onSelect, placeholder, onClear }: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const results = await searchScryfallCards(searchQuery);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Erro no autocomplete:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (card: ScryfallCard) => {
    setQuery(card.name); // Preenche sempre com o nome em inglês (canónico)
    onSelect(card);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (!newQuery && onClear) {
      onClear();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length > 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        className="bg-neutral-800 border-neutral-700 focus:ring-amber-500"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((card) => (
            <li
              key={card.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-amber-500/10"
              onClick={() => handleSelectSuggestion(card)}
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* ✨ MELHORIA: Mostra o nome em PT se for diferente do EN */}
              <span>{card.name}</span>
              {card.printed_name && card.lang === 'pt' && card.name.toLowerCase() !== card.printed_name.toLowerCase() && (
                <span className="text-neutral-400 ml-2">({card.printed_name})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
