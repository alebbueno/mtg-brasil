import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center text-center p-4">
      
      <div className="relative mb-6">
        <Compass className="h-24 w-24 text-neutral-700" />
        <span className="absolute -top-2 -right-3 text-7xl font-bold text-amber-500/80 animate-pulse">?</span>
      </div>

      <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 to-neutral-600">
        404
      </h1>
      
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-amber-500">
        Página Exilada
      </h2>
      
      <p className="mt-2 max-w-md text-base text-neutral-400">
        Parece que o planeswalker que você procura viajou para um plano desconhecido. O link pode estar quebrado ou a página foi enviada para o cemitério.
      </p>

      <Link href="/" className="mt-8">
        <Button className="bg-amber-500 text-black hover:bg-amber-600 font-bold py-3 px-6 text-base">
          <Home className="mr-2 h-5 w-5" />
          Retornar para a Home
        </Button>
      </Link>
      
    </div>
  );
}