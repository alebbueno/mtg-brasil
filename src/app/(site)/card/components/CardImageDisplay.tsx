import React from 'react';
import Image from 'next/image';

interface CardImageDisplayProps {
  imageUrl: string | undefined;
  altText: string;
  backImageUrl?: string | undefined;
  backAltText?: string;
}

const CardImageDisplay = ({ imageUrl, altText, backImageUrl, backAltText }: CardImageDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={altText}
          width={488}
          height={680}
          unoptimized
          className="rounded-2xl shadow-lg shadow-black/30"
          priority
        />
      )}
      {backImageUrl && (
        <Image
          src={backImageUrl}
          alt={backAltText || altText}
          width={488}
          height={680}
          unoptimized
          className="rounded-2xl shadow-lg shadow-black/30"
        />
      )}
    </div>
  );
};

export default CardImageDisplay;