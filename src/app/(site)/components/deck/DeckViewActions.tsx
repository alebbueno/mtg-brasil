/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// app/components/deck/DeckViewActions.tsx
'use client'

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DeckFromDB, DeckCard } from '@/app/lib/types';

// Props para o Componente de Ações
interface DeckViewActionsProps {
  deck: DeckFromDB;
}

export default function DeckViewActions({ deck }: DeckViewActionsProps) {
  
  // Função para formatar o decklist como texto
  const formatDecklistForExport = (): string => {
    let list = '';
    const commander = deck.format.toLowerCase() === 'commander' ? deck.decklist.mainboard[0] : null;
    
    if (commander) {
      list += `1 ${commander.name}\n\n`;
    }

    const mainboard = deck.decklist.mainboard.filter(c => c.name !== commander?.name);
    if(mainboard.length > 0) {
        list += `Mainboard (${mainboard.reduce((s,c) => s + c.count, 0)})\n`;
        mainboard.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => { list += `${c.count} ${c.name}\n` });
    }

    const sideboard = deck.decklist.sideboard || [];
    if(sideboard.length > 0) {
        list += `\nSideboard (${sideboard.reduce((s,c) => s + c.count, 0)})\n`;
        sideboard.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => { list += `${c.count} ${c.name}\n` });
    }
    return list;
  };

  // Função para copiar para a área de transferência
  const handleCopy = () => {
    const decklistText = formatDecklistForExport();
    navigator.clipboard.writeText(decklistText).then(() => {
      toast.success("Decklist copiada para a área de transferência!");
    }).catch(err => {
      toast.error("Não foi possível copiar a decklist.");
    });
  };

  // Função para exportar como .txt
  const handleExport = () => {
    const decklistText = formatDecklistForExport();
    const blob = new Blob([decklistText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.name.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Função para usar a API de Partilha do navegador
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deck de Magic: ${deck.name}`,
          text: `Confira meu deck "${deck.name}"!`,
          url: window.location.href, // Partilha o URL atual
        });
      } catch (error) {
        toast.error("Não foi possível partilhar o deck.");
      }
    } else {
      // Fallback para navegadores que não suportam a API de Partilha
      navigator.clipboard.writeText(window.location.href);
      toast.info("Link do deck copiado para a área de transferência!");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" type="button" onClick={handleShare}><Share2 className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent><p>Partilhar Deck</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" type="button" onClick={handleCopy}><Copy className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent><p>Copiar Decklist</p></TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" type="button" onClick={handleExport}><Download className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent><p>Exportar para .txt</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
