// app/auth/auth-code-error/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-neutral-950"
      style={{
        backgroundImage: `radial-gradient(circle at top right, rgba(239, 68, 68, 0.1), transparent 50%),
                          radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 60%)`,
      }}
    >
      <div className="w-full max-w-lg p-8 text-center bg-neutral-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-700/60">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-red-400">
            Ocorreu um Erro
          </h1>
          <p className="text-neutral-300 mt-3 text-lg">
            Não foi possível verificar a sua conta.
          </p>
        </header>
        
        <div className="text-neutral-400 mb-8">
          <p>
            O link de confirmação pode ter expirado ou ser inválido. Por favor, tente fazer login ou registar-se novamente.
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-amber-500 border-amber-400 hover:bg-amber-400 hover:text-black px-8 py-6 text-base"
            >
              Ir para o Login
            </Button>
          </Link>
          <Link href="/">
            <Button
              className="w-full sm:w-auto bg-amber-500 text-black hover:bg-amber-600 px-8 py-6 text-base"
            >
              Página Inicial
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
