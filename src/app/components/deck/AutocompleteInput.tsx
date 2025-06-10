/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
// app/components/deck/AutocompleteInput.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { searchScryfallCards } from '@/app/lib/scryfall'; // ✨ 1. Importa a nova função de busca
import type { ScryfallCard } from '@/app/lib/scryfall';   // ✨ 2. Importa o tipo ScryfallCard

interface AutocompleteInputProps {
  // ✨ 3. onSelect agora espera um objeto ScryfallCard ou null
  onSelect: (card: ScryfallCard | null) => void;
  placeholder?: string;
  onClear?: () => void; // Prop opcional para limpar a seleção
}

export default function AutocompleteInput({ onSelect, placeholder, onClear }: AutocompleteInputProps) {
  const [query, setQuery] = useState('');
  // ✨ 4. O estado de sugestões agora armazena objetos ScryfallCard
  const [suggestions, setSuggestions] = useState<ScryfallCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // ✨ 5. Usa a nova função que retorna objetos completos
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

  // Efeito para fechar a lista de sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✨ 6. A função de seleção agora trabalha com o objeto ScryfallCard
  const handleSelectSuggestion = (card: ScryfallCard) => {
    setQuery(card.name);      // Preenche o input com o NOME da carta
    onSelect(card);           // Informa o componente pai enviando o OBJETO INTEIRO
    setShowSuggestions(false); // Fecha a lista de sugestões
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (!newQuery && onClear) {
      onClear(); // Se o campo for limpo, notifica o pai
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
            // ✨ 7. A chave agora é o ID único da carta, e o evento de clique passa o objeto
            <li
              key={card.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-amber-500/10"
              onClick={() => handleSelectSuggestion(card)}
              onMouseDown={(e) => e.preventDefault()} // Evita que o input perca o foco antes do clique
            >
              {card.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}