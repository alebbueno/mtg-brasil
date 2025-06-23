import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CardDetailsDisplayProps {
  children: ReactNode;
}

const CardDetailsDisplay = ({ children }: CardDetailsDisplayProps) => {
  return (
    <Card className="bg-neutral-900 border-neutral-800 p-6">
      <CardContent className="p-0 space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default CardDetailsDisplay;