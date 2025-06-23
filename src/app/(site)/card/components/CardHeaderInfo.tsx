import React from 'react';
import ManaCost from '@/components/ui/ManaCost';

interface CardHeaderInfoProps {
  name: string;
  manaCost?: string;
}

const CardHeaderInfo = ({ name, manaCost }: CardHeaderInfoProps) => {
  return (
    <div className="flex justify-between items-start gap-4">
      <h1 className="text-4xl font-bold text-amber-400">{name}</h1>
      {manaCost && <ManaCost cost={manaCost} />}
    </div>
  );
};

export default CardHeaderInfo;