/* eslint-disable no-unused-vars */
'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GameCard } from "@/app/(play)/stores/playtest-store";
import Image from "next/image";

interface ZoneViewerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  zoneName: string;
  cards: GameCard[];
}

export default function ZoneViewerModal({ isOpen, onOpenChange, zoneName, cards }: ZoneViewerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-amber-400">{zoneName}</DialogTitle>
          <DialogDescription>
            {cards.length} carta(s) nesta zona. A carta mais recente está à esquerda.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full overflow-y-auto p-1 pr-4">
          {cards.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-3">
              {cards.map((card) => (
                <div key={card.instanceId} className="w-40">
                  <Image
                    src={card.image_uris?.normal || ''}
                    alt={card.name}
                    width={244}
                    height={340}
                    className="rounded-lg"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-10">Esta zona está vazia.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}