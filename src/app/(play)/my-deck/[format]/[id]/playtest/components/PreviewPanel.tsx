'use client'

import Image from 'next/image';
import ManaCost from '@/components/ui/ManaCost';
import { AnimatePresence, motion } from 'framer-motion';

interface PreviewPanelProps {
  imageUrl: string | null;
  manaCost: string | null | undefined;
}

export default function PreviewPanel({ imageUrl, manaCost }: PreviewPanelProps) {
  return (
    // AnimatePresence lida com a animação de entrada e saída do painel
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          // Painel posicionado no canto inferior direito da área principal
          className="absolute bottom-[256px] right-[20px] w-52 z-30 pointer-events-none"
        >
          <div className="flex flex-col gap-2">
            <Image
              src={imageUrl}
              alt="Pré-visualização da carta"
              width={244}
              height={340}
              className="rounded-lg shadow-2xl shadow-black/50"
              unoptimized
            />
            {/* O custo de mana só aparece se a prop for passada */}
            {manaCost && (
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2 flex justify-center">
                <ManaCost cost={manaCost} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}