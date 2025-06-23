import React from 'react';
import MagicTextRenderer from '@/app/(site)/components/ui/MagicTextRenderer';

interface CardOracleTextProps {
  oracleText?: string;
}

const CardOracleText = ({ oracleText }: CardOracleTextProps) => {
  return <MagicTextRenderer text={oracleText} />;
};

export default CardOracleText;