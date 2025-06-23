import React from 'react';

interface CardPowerToughnessProps {
  power?: string;
  toughness?: string;
}

const CardPowerToughness = ({ power, toughness }: CardPowerToughnessProps) => {
  if (!power || !toughness) return null;
  return <p className="font-bold text-2xl text-right text-neutral-200 pt-4">{power} / {toughness}</p>;
};

export default CardPowerToughness;