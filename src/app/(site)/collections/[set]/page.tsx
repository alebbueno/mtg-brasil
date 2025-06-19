'use client';

import { useEffect, useState, useRef, useCallback, use } from 'react';
import { SetHeader } from './components/SetHeader';
import { CardItem } from './components/CardItem';
import { SkeletonCard } from './components/SkeletonCard';

export default function SetPage({ params }: { params: Promise<{ set: string }> }) {
  const { set } = use(params); // ← Aqui faz o unwrap correto

  const [cards, setCards] = useState<any[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [setInfo, setSetInfo] = useState<any>(null);

  const observer = useRef<IntersectionObserver | undefined>(undefined);

  const lastCardRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextPage) {
          fetchMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, nextPage]
  );

  const fetchSetInfo = async () => {
    const res = await fetch(`https://api.scryfall.com/sets/${set}`);
    const data = await res.json();
    setSetInfo(data);
  };

  const fetchCards = async () => {
    setLoading(true);
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=e:${set}`
    );
    const data = await res.json();
    setCards(data.data);
    setNextPage(data.has_more ? data.next_page : null);
    setLoading(false);
  };

  const fetchMore = async () => {
    if (!nextPage) return;
    setLoading(true);
    const res = await fetch(nextPage);
    const data = await res.json();
    setCards((prev) => [...prev, ...data.data]);
    setNextPage(data.has_more ? data.next_page : null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSetInfo();
    fetchCards();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {setInfo && (
        <SetHeader
          name={setInfo.name}
          released_at={setInfo.released_at}
          card_count={setInfo.card_count}
          icon={setInfo.icon_svg_uri}
        />
      )}

      <main className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {(cards ?? []).map((card, index) => {
          const isLast = index === cards.length - 1;
          return (
            <div ref={isLast ? lastCardRef : null} key={card.id}>
              <CardItem
                id={card.id}
                name={card.name}
                image={card.image_uris?.normal}
              />
            </div>
          );
        })}


        {loading &&
          Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
      </main>

      {loading && !cards.length && (
        <p className="text-center text-neutral-400 py-4">Carregando...</p>
      )}
    </div>
  );
}
