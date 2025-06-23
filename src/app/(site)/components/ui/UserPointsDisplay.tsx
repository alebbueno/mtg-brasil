import { Coins } from 'lucide-react';

interface UserPointsDisplayProps {
  points: number | null | undefined;
  size?: 'sm' | 'default';
  className?: string;
}

export default function UserPointsDisplay({ points, size = 'default', className = '' }: UserPointsDisplayProps) {
  const textSize = size === 'sm' ? 'text-sm' : 'text-lg';
  
  return (
    <div className={`inline-flex items-center gap-2 font-semibold ${className}`}>
      <Coins className="h-5 w-5 text-yellow-400" />
      <span className={`${textSize} text-yellow-400`}>
        {/* Formata o número para ter separador de milhar, ex: 1.250 */}
        {points?.toLocaleString('pt-BR') || 0}
      </span>
      <span className={`${textSize} text-neutral-400`}>
        Pontos
      </span>
    </div>
  );
}