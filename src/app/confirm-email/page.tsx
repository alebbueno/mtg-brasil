// app/confirm-email/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MailCheck } from 'lucide-react';

export default function ConfirmEmailPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-neutral-950"
      style={{
        backgroundImage: `radial-gradient(circle at top right, rgba(217, 119, 6, 0.08), transparent 50%),
                          radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.08), transparent 60%)`,
      }}
    >
      <div className="w-full max-w-lg p-8 text-center bg-neutral-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-700/60">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-500/10 rounded-full border border-green-500/30">
            <MailCheck className="h-12 w-12 text-green-400" />
          </div>
        </div>

        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-amber-400">
            Verifique o seu e-mail
          </h1>
          <p className="text-neutral-300 mt-3 text-lg">
            Enviámos um link de confirmação para a sua caixa de entrada.
          </p>
        </header>
        
        <div className="text-neutral-400 space-y-4">
          <p>
            Por favor, clique no link nesse e-mail para ativar a sua conta. Se não o encontrar, verifique a sua pasta de spam.
          </p>
          <p className="text-sm">
            Depois de confirmar, poderá fazer login e aceder a todas as funcionalidades.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-black px-8 py-6 text-base"
            >
              Voltar para o Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
