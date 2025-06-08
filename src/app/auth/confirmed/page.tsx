// app/auth/confirmed/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function AuthConfirmedPage() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-neutral-950"
      style={{
        backgroundImage: `radial-gradient(circle at top right, rgba(74, 222, 128, 0.1), transparent 50%),
                          radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 60%)`,
      }}
    >
      <div className="w-full max-w-lg p-8 text-center bg-neutral-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-700/60">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-500/10 rounded-full border border-green-500/30">
            <CheckCircle2 className="h-12 w-12 text-green-400" />
          </div>
        </div>

        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-green-400">
            Conta Confirmada!
          </h1>
          <p className="text-neutral-300 mt-3 text-lg">
            O seu e-mail foi verificado com sucesso.
          </p>
        </header>
        
        <div className="text-neutral-400 mb-8">
          <p>
            Agora já pode fazer login e começar a explorar todas as funcionalidades.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/login">
            <Button
              className="w-full sm:w-auto bg-amber-500 text-black hover:bg-amber-600 px-10 py-6 text-base"
            >
              Ir para o Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
