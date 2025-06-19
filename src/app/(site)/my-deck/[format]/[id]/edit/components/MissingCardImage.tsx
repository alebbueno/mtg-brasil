'use client';

import { CSSProperties } from 'react';

interface MissingCardImageProps {
  name: string;
  missing: number;
  imageUrl: string | undefined;
}

const containerStyle: CSSProperties = {
  position: 'relative',
  width: '150px',
  margin: '8px',
};

const imageStyle: CSSProperties = {
  width: '150px',
  height: '209px',
  borderRadius: '7px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  objectFit: 'cover',
};

const quantityStyle: CSSProperties = {
  position: 'absolute',
  top: '-10px',
  right: '-10px',
  backgroundColor: '#ef4444',
  color: 'white',
  borderRadius: '50%',
  width: '28px',
  height: '28px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '0.875rem',
  fontWeight: 'bold',
  border: '2px solid white',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
};

export default function MissingCardImage({ name, missing, imageUrl }: MissingCardImageProps) {
  return (
    <div style={containerStyle}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          style={imageStyle}
          crossOrigin="anonymous"
        />
      ) : (
        <div
          style={{
            ...imageStyle,
            backgroundColor: '#333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '0.75rem',
            textAlign: 'center',
            padding: '4px',
          }}
        >
          Sem imagem
        </div>
      )}

      {missing > 0 && (
        <div style={quantityStyle}>{missing}</div>
      )}
    </div>
  );
}
