'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MagicTextRenderer from '@/app/(site)/components/ui/MagicTextRenderer';
import { Languages } from 'lucide-react';

interface CardTextDisplayProps {
  originalText: string | null | undefined;
  translatedText: string | null | undefined;
}

export default function CardTextDisplay({ originalText, translatedText }: CardTextDisplayProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  // Se não houver texto original, não renderiza nada.
  if (!originalText) {
    return null;
  }

  // Determina qual texto exibir com base no estado 'showOriginal'
  const textToDisplay = showOriginal ? originalText : (translatedText || originalText);
  const buttonText = showOriginal ? "Ver Tradução" : "Ver Original";

  return (
    <div className="space-y-4">
      {/* Renderiza o texto da carta usando nosso componente que formata os símbolos de mana */}
      <MagicTextRenderer text={textToDisplay} />
      
      {/* O botão só aparece se houver uma tradução disponível e diferente da original */}
      {translatedText && translatedText !== originalText && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowOriginal(!showOriginal)}
        >
          <Languages className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      )}
    </div>
  );
}