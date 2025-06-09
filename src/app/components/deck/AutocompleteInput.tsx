/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
// app/components/deck/AutocompleteInput.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { fetchAutocomplete } from '@/app/lib/scryfall';

interface AutocompleteInputProps {
  onSelect: (value: string) => void;
  placeholder?: string;
}

export default function AutocompleteInput({ onSelect, placeholder }: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para buscar sugestões com debounce para evitar chamadas excessivas à API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const results = await fetchAutocomplete(searchQuery);
      setSuggestions(results.data || []);
    } catch (error) {
      console.error("Erro no autocomplete:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Aplica um debounce de 300ms antes de fazer a busca
    const debounceTimer = setTimeout(() => {
      if (query.length > 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion); // Preenche o input com a seleção
    onSelect(suggestion); // Informa o componente pai sobre a seleção
    setSuggestions([]); // Fecha a lista de sugestões
  };

  return (
    <div className="relative">
      <Input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onSelect(e.target.value) // Atualiza o valor enquanto digita
        }}
        placeholder={placeholder}
        className="bg-neutral-800 border-neutral-700 focus:ring-amber-500"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-neutral-800 border border-neutral-700 rounded-md mt-1 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-amber-500/10"
              onClick={() => handleSelectSuggestion(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
