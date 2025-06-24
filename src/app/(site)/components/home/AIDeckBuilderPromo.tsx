import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import Link from 'next/link';

export default function AIDeckBuilderPromo() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="relative isolate overflow-hidden bg-neutral-900 px-6 py-24 text-center shadow-2xl rounded-2xl sm:px-16
                        border border-amber-500/20">

          {/* Efeito de Fundo "Aurora" */}
          <div
            className="absolute -top-24 left-1/2 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 [background:radial-gradient(closest-side,rgba(245,158,11,0.2),_transparent)]"
            aria-hidden="true"
          ></div>
          
          <div
            className="absolute -top-40 -left-96 -z-10 h-[50rem] w-[50rem] -translate-x-1/2 [background:radial-gradient(closest-side,rgba(99,102,241,0.15),_transparent)]"
            aria-hidden="true"
          ></div>


          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Sem ideias para o próximo deck?
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-400 bg-clip-text text-transparent bg-[size:200%_auto] animate-gradient-shine">
              Deixa com a IA.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-neutral-300">
            Dê um comandante, uma carta que você ama ou apenas uma ideia maluca. Nossa IA vasculha o multiverso para construir um deck completo e sinérgico pra você em segundos.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/ai-deck-builder">
                <Button size="lg" className="bg-amber-400 text-amber-950 font-bold hover:bg-amber-300 text-base shadow-lg shadow-amber-500/20">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Criar com Magia Artificial
                </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}