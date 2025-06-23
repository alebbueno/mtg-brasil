'use client'

import ManaCost from "@/components/ui/ManaCost";

interface MagicTextRendererProps {
  text: string | null | undefined;
}

export default function MagicTextRenderer({ text }: MagicTextRendererProps) {
  if (!text) return null;

  const paragraphs = text.split('\n');

  return (
    <div className="space-y-3 font-serif text-lg leading-relaxed text-neutral-300">
      {paragraphs.map((paragraph, pIndex) => {
        const parts = paragraph.split(/(\{[^}]+\})/g);
        
        return (
          <p key={pIndex}>
            {parts.map((part, partIndex) => {
              if (part.match(/(\{[^}]+\})/g)) {
                return <ManaCost key={partIndex} cost={part} className="mx-0.5" />;
              }
              return <span key={partIndex}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}