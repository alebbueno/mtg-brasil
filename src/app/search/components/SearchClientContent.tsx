'use client';

import { useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import SearchFilters from '@/app/search/components/Filter';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro na busca');
  return res.json();
};

interface MTGCard {
  id: string;
  name: string;
  image_uris?: {
    normal?: string;
    small?: string;
    art_crop?: string;
  };
  type_line?: string;
}

interface ApiResponse {
  data: MTGCard[];
  has_more: boolean;
  next_page?: string;
}

export default function SearchClientContent() {
  const searchParams = useSearchParams();
  const query = decodeURIComponent(searchParams.get('q') || '');

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRarity, setSelectedRarity] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string>('');
  const [selectedCmc, setSelectedCmc] = useState<string[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>('');

  const [tempTypes, setTempTypes] = useState<string[]>(selectedTypes);
  const [tempColors, setTempColors] = useState<string[]>(selectedColors);
  const [tempRarity, setTempRarity] = useState<string[]>(selectedRarity);
  const [tempFormats, setTempFormats] = useState<string[]>(selectedFormats);
  const [tempSet, setTempSet] = useState<string>(selectedSet);
  const [tempCmc, setTempCmc] = useState<string[]>(selectedCmc);
  const [tempArtist, setTempArtist] = useState<string>(selectedArtist);

  const getKey = (pageIndex: number, previousPageData: ApiResponse | null): string | null => {
    if (!query) return null;
    if (previousPageData && !previousPageData.has_more) return null;

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('page', (pageIndex + 1).toString());
    if (selectedTypes.length) params.set('types', selectedTypes.join(','));
    if (selectedColors.length) params.set('colors', selectedColors.join(','));
    if (selectedRarity.length) params.set('rarity', selectedRarity.join(','));
    if (selectedFormats.length) params.set('formats', selectedFormats.join(','));
    if (selectedSet) params.set('set', selectedSet);
    if (selectedCmc.length) params.set('cmc', selectedCmc.join(','));
    if (selectedArtist) params.set('artist', selectedArtist);

    return `${baseUrl}/api/search?${params.toString()}`;
  };

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite<ApiResponse>(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const isLoadingInitialData = !data && !error && isLoading;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined') || (isLoading && size > 0);

  const isEmpty = data?.[0]?.data?.length === 0 && !isLoadingInitialData;
  const hasMore = data?.[data.length - 1]?.has_more === true;

  const cards: MTGCard[] = data ? data.flatMap((page) => page.data) : [];

  const loaderRef = useRef<HTMLDivElement>(null);

  const handleApplyFilters = useCallback(() => {
    setSelectedTypes(tempTypes);
    setSelectedColors(tempColors);
    setSelectedRarity(tempRarity);
    setSelectedFormats(tempFormats);
    setSelectedSet(tempSet);
    setSelectedCmc(tempCmc);
    setSelectedArtist(tempArtist);
    setSize(1);
  }, [tempTypes, tempColors, tempRarity, tempFormats, tempSet, tempCmc, tempArtist, setSize]);

  const handleOpenFilters = useCallback(() => {
    setTempTypes(selectedTypes);
    setTempColors(selectedColors);
    setTempRarity(selectedRarity);
    setTempFormats(selectedFormats);
    setTempSet(selectedSet);
    setTempCmc(selectedCmc);
    setTempArtist(selectedArtist);
  }, [selectedTypes, selectedColors, selectedRarity, selectedFormats, selectedSet, selectedCmc, selectedArtist]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore || isLoadingMore || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSize((prevSize) => prevSize + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isValidating, setSize]);

  if (!query && !isLoadingInitialData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Nenhuma busca realizada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-300 mb-4">Digite um termo de busca no campo acima.</p>
            <Link href="/">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Voltar para a página inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !isLoadingInitialData) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Card className="bg-neutral-800 border-neutral-700">
          <CardContent className="p-6">
            <p className="text-red-500 font-semibold">Erro ao buscar resultados.</p>
            <p className="text-neutral-300 mt-2">Tente novamente ou use outro termo de busca.</p>
            <Link href="/" className="mt-4 inline-block">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Voltar para a página inicial
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingInitialData && query) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-9 w-1/2 bg-neutral-700" />
            <Skeleton className="h-10 w-24 bg-neutral-700" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="bg-neutral-800 border-neutral-700">
                <CardContent className="p-2">
                  <Skeleton className="h-[300px] sm:h-[350px] w-full rounded-md bg-neutral-700" />
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded bg-neutral-700" />
                    <Skeleton className="h-3 w-1/2 rounded bg-neutral-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Busca: “{query}”</h1>
          <SearchFilters
            selectedTypes={tempTypes}
            setSelectedTypes={setTempTypes}
            selectedColors={tempColors}
            setSelectedColors={setTempColors}
            selectedRarity={tempRarity}
            setSelectedRarity={setTempRarity}
            selectedFormats={tempFormats}
            setSelectedFormats={setTempFormats}
            selectedSet={tempSet}
            setSelectedSet={setTempSet}
            selectedCmc={tempCmc}
            setSelectedCmc={setTempCmc}
            selectedArtist={tempArtist}
            setSelectedArtist={setTempArtist}
            onApplyFilters={handleApplyFilters}
            onOpen={handleOpenFilters}
          />
        </div>

        {isEmpty && query && (
          <div className="flex items-center justify-center min-h-[40vh] text-center">
            <Card className="bg-neutral-800 border-neutral-700">
              <CardContent className="p-6">
                <p className="text-neutral-300">
                  Nenhuma carta encontrada com os critérios para “{query}”.
                </p>
                <p className="text-neutral-400 text-sm mt-2">Tente refinar seus filtros ou alterar o termo de busca.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!isEmpty && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {cards.map((card: MTGCard) => (
              <Link
                href={`/card/cardId/${encodeURIComponent(card.id)}`} // Usa ID por padrão para evitar ambiguidades
                // Para usar nome, substitua por: href={`/card/${encodeURIComponent(card.name)}`}
                key={card.id}
                className="group"
              >
                <Card className="bg-neutral-800 border-neutral-700 hover:border-amber-500 transition-colors duration-150">
                  <CardContent className="p-2">
                    {card.image_uris?.normal ? (
                      <Image
                        src={card.image_uris.normal}
                        alt={card.name}
                        width={250}
                        height={350}
                        className="rounded-md w-full object-contain aspect-[5/7]"
                        unoptimized
                      />
                    ) : (
                      <Skeleton className="h-[300px] sm:h-[350px] w-full rounded-md bg-neutral-700 flex items-center justify-center">
                        <span className="text-neutral-500 text-sm">Sem imagem</span>
                      </Skeleton>
                    )}
                    <div className="mt-2">
                      <h2 className="text-base font-semibold truncate group-hover:text-amber-500">{card.name}</h2>
                      <p className="text-neutral-400 text-sm truncate">{card.type_line}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {isLoadingMore &&
              [...Array(5)].map((_, i) => (
                <Card key={`loading-${i}`} className="bg-neutral-800 border-neutral-700 animate-pulse">
                  <CardContent className="p-2">
                    <Skeleton className="h-[300px] sm:h-[350px] w-full rounded-md bg-neutral-700" />
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded bg-neutral-700" />
                      <Skeleton className="h-3 w-1/2 rounded bg-neutral-700" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
        <div ref={loaderRef} className="h-10 w-full" />
      </div>
    </div>
  );
}