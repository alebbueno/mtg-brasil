'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ManaColorLinkProps {
  symbol: string;
  name: string;
  textColor: string;
  href: string;
}

export default function ManaColorLink({ symbol, name, textColor, href }: ManaColorLinkProps) {
  const manaSymbolClass = `ms ms-cost ms-${symbol.toLowerCase()}`;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-4"
    >
      <Link href={href} className="flex flex-col items-center group">
        <i
          className={cn(
            manaSymbolClass,
            "transition-transform duration-300 group-hover:scale-110",
            textColor
          )}
          style={{
            fontSize: '2rem',          // << AQUI O TAMANHO REALMENTE GRANDE DO ÍCONE
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5rem',
            height: '5rem',
            borderRadius: '50%',
          }}
        />
        <span
          className={cn(
            "mt-4 text-base md:text-lg font-semibold tracking-wide uppercase text-center",
            "transition-colors duration-300",
            symbol === 'M'
              ? "bg-gradient-to-r from-amber-400 to-fuchsia-500 bg-clip-text text-transparent"
              : "text-neutral-300 group-hover:text-white"
          )}
        >
          {name}
        </span>
      </Link>
    </motion.div>
  );
}
