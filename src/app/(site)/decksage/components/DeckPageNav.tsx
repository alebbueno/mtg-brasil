/* eslint-disable no-undef */
'use client'

import { Button } from "@/components/ui/button";
import { LayoutList, BookOpenText, BrainCircuit } from "lucide-react";

export default function DeckPageNav() {
  
  // Função que lida com a rolagem suave
  const handleScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // O 'offsetTop' considera a altura do header fixo para não cobrir o título
      const headerOffset = 80; // Ajuste este valor conforme a altura do seu Header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    // 'sticky top-16' faz o menu "colar" abaixo do seu header principal ao rolar
    <div className="sticky top-16 z-40 bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-800 -mx-6 px-6 py-2 mb-8">
        <div className="container mx-auto flex justify-center gap-2">
            <Button variant="ghost" onClick={() => handleScrollTo('decklist')}>
                <LayoutList className="mr-2 h-4 w-4"/>Decklist
            </Button>
            <Button variant="ghost" onClick={() => handleScrollTo('analysis')}>
                <BookOpenText className="mr-2 h-4 w-4"/>Análise
            </Button>
            <Button variant="ghost" onClick={() => handleScrollTo('guide')}>
                <BrainCircuit className="mr-2 h-4 w-4"/>Guia de Como Jogar
            </Button>
        </div>
    </div>
  );
}