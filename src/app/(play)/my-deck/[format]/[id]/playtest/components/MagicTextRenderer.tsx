'use client'

import ManaCost from "@/components/ui/ManaCost";

interface MagicTextRendererProps {
  text: string | null | undefined;
}

// Este componente pega uma string e a transforma em JSX,
// substituindo os símbolos de mana pelo nosso componente ManaCost.
export default function MagicTextRenderer({ text }: MagicTextRendererProps) {
  if (!text) {
    return null;
  }

  // Divide o texto em parágrafos (baseado nas quebras de linha)
  const paragraphs = text.split('\n');

  return (
    <div className="space-y-2 font-serif text-neutral-200">
      {paragraphs.map((paragraph, pIndex) => {
        // Encontra todos os símbolos de mana como {W}, {U}, {T}, {10}, etc.
        const parts = paragraph.split(/(\{[^}]+\})/g);
        
        return (
          <p key={pIndex}>
            {parts.map((part, partIndex) => {
              if (part.match(/(\{[^}]+\})/g)) {
                // Se for um símbolo de mana, renderiza o componente ManaCost
                return <ManaCost key={partIndex} cost={part} className="mx-0.5" />;
              }
              // Se for texto normal, apenas o exibe
              return <span key={partIndex}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}