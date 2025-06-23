/* eslint-disable no-unused-vars */
'use client'

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { GameCard } from "@/app/(play)/stores/playtest-store";
import { translateCardText } from '@/app/actions/aiActions';
import Image from "next/image";
import { Languages, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ManaCost from '@/components/ui/ManaCost';
import MagicTextRenderer from './MagicTextRenderer';

interface CardDetailModalProps {
  card: GameCard | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function CardDetailModal({ card, isOpen, onOpenChange }: CardDetailModalProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setTranslatedText(null);
      setError(null);
    }
  }, [isOpen]);

  if (!card) return null;

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    if (!card.oracle_text) {
      toast.info("Esta carta não tem texto para traduzir.");
      return;
    }
    setIsTranslating(true);
    setError(null);
    const result = await translateCardText(card.id, card.name, card.oracle_text);
    if (result.translatedText) {
      setTranslatedText(result.translatedText);
    } else {
      setError(result.error || "Ocorreu um erro desconhecido.");
      toast.error(result.error || "Ocorreu um erro desconhecido.");
    }
    setIsTranslating(false);
  };

  const textToDisplay = translatedText || card.oracle_text;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* AJUSTE: Para forçar a largura, removemos a classe de max-w padrão e definimos a nossa.
        'sm:max-w-6xl' garante que em telas maiores o modal será mais largo.
        O Shadcn/UI por padrão limita a `425px`.
      */}
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-6xl grid-cols-1 md:grid-cols-2 gap-8 py-6 px-12">
        
        {/* Coluna da Esquerda: Imagem da Carta */}
        <div className="w-full flex justify-center items-start pt-4">
          {/* A imagem foi aumentada para aproveitar o novo espaço */}
          <Image src={card.image_uris?.normal || ''} alt={card.name} width={400} height={558} className="rounded-xl shadow-lg" unoptimized />
        </div>

        {/* Coluna da Direita: Detalhes da Carta */}
        <div className="flex flex-col h-full">
          <DialogHeader className="text-left">
            <div className="flex justify-between items-start gap-4">
              <DialogTitle className="text-3xl font-bold text-amber-400">{card.name}</DialogTitle>
              {card.mana_cost && <ManaCost cost={card.mana_cost} />}
            </div>
            <DialogDescription className="text-neutral-400 pt-1">{card.type_line}</DialogDescription>
          </DialogHeader>

          <div className="my-4 border-b border-neutral-800"></div>

          <div className="flex-grow space-y-4 overflow-y-auto pr-2">
            <MagicTextRenderer text={textToDisplay} />
            {card.flavor_text && <p className="text-neutral-400 italic font-serif pt-4 border-t border-neutral-800/50">&quot;{card.flavor_text}&quot;</p>}
            {card.power && card.toughness && (
              <p className="font-bold text-xl text-right text-neutral-200 pt-4">{card.power} / {card.toughness}</p>
            )}
            {error && <p className="text-red-500">{error}</p>}
          </div>
          
          <div className="mt-4 border-t border-neutral-800 pt-4">
            <div className="flex gap-2">
              <Button onClick={handleTranslate} disabled={isTranslating || !card.oracle_text}>
                {isTranslating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                {translatedText ? 'Ver Original' : 'Traduzir Texto'}
              </Button>
              {translatedText && (
                   <Button variant="secondary" onClick={() => setTranslatedText(null)}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Restaurar Original
                  </Button>
              )}
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}