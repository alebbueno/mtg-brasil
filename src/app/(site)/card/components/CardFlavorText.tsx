import React from 'react';

interface CardFlavorTextProps {
  flavorText?: string;
}

const CardFlavorText = ({ flavorText }: CardFlavorTextProps) => {
  return (
    flavorText && (
      <p className="text-neutral-400 italic pt-4 border-t border-neutral-800">
        &quot;{flavorText}&quot;
      </p>
    )
  );
};

export default CardFlavorText;