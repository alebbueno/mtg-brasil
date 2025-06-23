/* eslint-disable no-undef */
'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function UserSearch({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Estado para o valor do input e para o loading
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query')?.toString() || '');
  const [isSearching, setIsSearching] = useState(false);

  // Função para lidar com a submissão do formulário
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Volta para a primeira página ao buscar

    if (searchTerm) {
      params.set('query', searchTerm);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  // Desativa o spinner quando a navegação termina (os parâmetros da URL mudam)
  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  return (
    // O input e o botão agora estão dentro de um formulário
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-800 border-neutral-700 pl-10"
        />
      </div>
      <Button type="submit" disabled={isSearching}>
        {isSearching ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        Buscar
      </Button>
    </form>
  );
}