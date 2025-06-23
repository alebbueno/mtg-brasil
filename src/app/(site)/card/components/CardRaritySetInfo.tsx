import React from 'react';

interface CardRaritySetInfoProps {
  rarity?: string;
  setName?: string;
}

const CardRaritySetInfo = ({ rarity, setName }: CardRaritySetInfoProps) => {
  const rarityDisplay = rarity ? `Rarity: ${rarity}` : '';
  const setNameDisplay = setName ? `Set: ${setName}` : '';
  const separator = rarity && setName ? ' | ' : '';

  return <p className="text-sm text-neutral-500">{rarityDisplay}{separator}{setNameDisplay}</p>;
};

export default CardRaritySetInfo;