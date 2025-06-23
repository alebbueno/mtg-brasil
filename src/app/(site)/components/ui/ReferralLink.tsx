/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralLinkProps {
  referralCode: string | null;
}

export default function ReferralLink({ referralCode }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);

  if (!referralCode) {
    return <p className="text-sm text-neutral-400">Código de convite indisponível.</p>;
  }

  // Monta a URL completa do convite
  const link = `${process.env.NEXT_PUBLIC_API_URL}/signup?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success("Link de convite copiado!");
      setTimeout(() => setCopied(false), 2000); // Reseta o ícone após 2 segundos
    }, (err) => {
      toast.error("Não foi possível copiar o link.");
      console.error('Erro ao copiar:', err);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Input value={link} readOnly className="bg-neutral-800 border-neutral-700 font-mono text-sm" />
      <Button size="icon" onClick={handleCopy} variant="secondary">
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}