/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/components/deck/AutocompleteInput.tsx
'use client'

import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchScryfallCards } from '@/app/(site)/lib/scryfall';
import type { ScryfallCard } from '@/app/(site)/lib/scryfall';
import { Search, Loader2 } from 'lucide-react';
import ManaCost from '@/components/ui/ManaCost';

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

  const handleSearch = useCallback(async () => {
    if (query.length < 2) return;

    setIsLoading(true);
    setSuggestions([]);

    try {
      let searchTerm = query;
      try {
        const translateResponse = await fetch('/api/translate-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: query, type: 'query' })
        });
        
        if(translateResponse.ok) {
            const data = await translateResponse.json();
            if (data.translation) {
                searchTerm = data.translation;
            }
        }
      } catch (e) {
          console.error("Falha ao contatar a API de tradução. A usar o termo original.", e);
      }

      const finalScryfallQuery = `name:"${searchTerm}"`;
      const results = await searchScryfallCards(finalScryfallQuery);
      
      const uniqueSuggestions = Array.from(new Map(results.map(card => [card.id, card])).values());

      setSuggestions(uniqueSuggestions);
      setShowSuggestions(true);

    } catch (error) {
      console.error("Erro geral na busca do Autocomplete:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

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
    setQuery(card.name); 
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
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 2 && suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-neutral-800 border-neutral-700 focus:ring-amber-500 pr-10"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>

      {showSuggestions && (
        <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded-md mt-1 shadow-lg max-h-80 overflow-y-auto">
          {suggestions.length > 0 ? (
            suggestions.map((card) => (
              <li
                key={card.id}
                className="px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-amber-500/10"
                onClick={() => handleSelectSuggestion(card)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <div className="flex-grow">
                    <div className="text-sm font-medium text-neutral-100">{card.name}</div>
                    <div className="text-xs text-neutral-400">{card.type_line}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {card.set_name} ({card.set.toUpperCase()})
                    </div>
                </div>
                <div className="flex-shrink-0">
                  <ManaCost cost={card.mana_cost} />
                </div>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-neutral-400 text-center">Nenhuma carta encontrada.</li>
          )}
        </ul>
      )}
    </div>
  );
}
