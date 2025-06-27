/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CopyButton({ textToCopy }: { textToCopy: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            toast.success("Copiado para a área de transferência!");
            setTimeout(() => setCopied(false), 2000); // Reseta o ícone após 2 segundos
        }, (err) => {
            toast.error("Falha ao copiar.");
            console.error('Erro ao copiar:', err);
        });
    };

    return (
        <Button variant="outline" size="icon" onClick={handleCopy} className="h-8 w-8">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
    )
}