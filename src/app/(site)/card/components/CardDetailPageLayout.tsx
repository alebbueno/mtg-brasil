import React, { ReactNode } from 'react';

interface CardDetailPageLayoutProps {
  children: ReactNode;
}

const CardDetailPageLayout = ({ children }: CardDetailPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-neutral-950 py-12">
      <div className="container mx-auto px-6">
        {children}
      </div>
    </div>
  );
};

export default CardDetailPageLayout;