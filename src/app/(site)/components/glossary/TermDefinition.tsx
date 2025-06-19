'use client';

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TermDefinitionProps {
  displayTerm: string;
  apiTerm: string;
  definition: string;
}

export default function TermDefinition({ displayTerm, definition }: TermDefinitionProps) {
  return (
    <AccordionItem value={displayTerm}>
      <AccordionTrigger
        className="hover:bg-neutral-800/50 px-4 rounded-md data-[state=open]:bg-neutral-700/60"
      >
        <span className="text-lg font-medium text-amber-500">{displayTerm}</span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-2 pb-4 text-neutral-300 leading-relaxed">
        {definition ? (
          <p>{definition}</p>
        ) : (
          <p className="text-neutral-500 italic">Nenhuma definição disponível.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}