import React from 'react';

interface CardTypeLineProps {
  typeLine?: string;
}

const CardTypeLine = ({ typeLine }: CardTypeLineProps) => {
  return <p className="text-lg text-neutral-300">{typeLine}</p>;
};

export default CardTypeLine;