'use client';

import { useSearchParams } from 'next/navigation';
import useSWRInfinite from 'swr/infinite';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Erro na busca');
  return res.json();
});

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const {
    data,
    error,
    size,
    setSize,
    // isValidating,
  } = useSWRInfinite(
    (index) =>
      query
        ? `${baseUrl}/api/search?q=${encodeURIComponent(query)}&page=${index + 1}`
        : null,
    fetcher,
    {
      revalidateFirstPage: false,
    }
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data?.length === 0;
  const hasMore = data?.[data.length - 1]?.has_more;

  const cards = data ? data.flatMap((d) => d.data) : [];

  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMore) {
          setSize((size) => size + 1);
        }
      },
      { threshold: 1 }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, isLoadingMore, setSize]);

  if (!query) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-neutral-400">Erro ao buscar resultados.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Resultados da busca: &quot;{query}&quot;
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          {cards.map((card: any) => (
            <Link
              href={`/card/${encodeURIComponent(card.name)}`}
              key={card.id}
              className="group"
            >
              <Card className="bg-neutral-800 border-neutral-700 hover:border-amber-500 transition">
                <CardContent className="p-2">
                  {card.image_uris?.normal ? (
                    <Image
                      src={card.image_uris.normal}
                      alt={card.name}
                      width={250}
                      height={350}
                      className="rounded-md w-full"
                    />
                  ) : (
                    <Skeleton className="h-[350px] w-full rounded-md bg-neutral-700" />
                  )}
                  <div className="mt-2">
                    <h2 className="text-base font-semibold truncate">{card.name}</h2>
                    <p className="text-neutral-400 text-sm truncate">{card.type_line}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {(isLoadingInitialData || isLoadingMore) &&
            [...Array(10)].map((_, i) => (
              <Card key={i} className="bg-neutral-800 border-neutral-700">
                <CardContent className="p-2">
                  <Skeleton className="h-[350px] w-full rounded-md bg-neutral-700" />
                  <div className="mt-2 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded bg-neutral-700" />
                    <Skeleton className="h-3 w-1/2 rounded bg-neutral-700" />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {isEmpty && (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Card className="bg-neutral-800 border-neutral-700">
              <CardContent className="p-6">
                <p className="text-neutral-300">
                  Nenhuma carta encontrada para &quot;{query}&quot;.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={loaderRef} className="h-10" />
      </div>
    </div>
  );
}
