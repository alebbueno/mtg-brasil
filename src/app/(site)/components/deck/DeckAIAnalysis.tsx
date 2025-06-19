// app/components/deck/DeckAIAnalysis.tsx
'use client'

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, Sparkles, ShieldCheck, ShieldAlert, Wrench, RefreshCw } from 'lucide-react';
import { analyzeDeckWithAI } from '@/app/(site)/actions/deckActions';
import type { DeckFromDB } from '@/app/(site)/lib/types';

// O tipo para o resultado da análise, que será guardado no estado
interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface DeckAIAnalysisProps {
  deck: DeckFromDB;
  // A análise guardada na base de dados é passada para o componente
  initialAnalysis: AnalysisResult | null; 
}

export default function DeckAIAnalysis({ deck, initialAnalysis }: DeckAIAnalysisProps) {
  // O estado começa com a análise que já pode existir na base de dados
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initialAnalysis);
  const [isAnalyzing, startTransition] = useTransition();

  const handleAnalysis = () => {
    startTransition(async () => {
      // Formata a lista de cartas para enviar para a IA
      const decklistText = deck.decklist.mainboard.map(c => `${c.count} ${c.name}`).join('\n');
      
      // ✨ CORREÇÃO: A chamada à ação agora envia o ID do deck e a lista de cartas ✨
      const result = await analyzeDeckWithAI(deck.id, decklistText);

      if (result.error) {
        toast.error(result.error);
      } else if (result.analysis) {
        setAnalysis(result.analysis);
        toast.success("Análise do deck concluída!");
      }
    });
  };

  // Se já houver uma análise, exibe os resultados e um botão para refazer
  if (analysis) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Sparkles /> Análise da IA
            </CardTitle>
            <Button onClick={handleAnalysis} disabled={isAnalyzing} variant="ghost" size="sm">
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Refazer</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-1"><ShieldCheck size={16} /> Pontos Fortes</h4>
            <ul className="list-disc list-inside text-neutral-300 space-y-1 pl-2">
              {analysis.strengths.map((item, i) => <li key={`strength-${i}`}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-1"><ShieldAlert size={16} /> Pontos Fracos</h4>
            <ul className="list-disc list-inside text-neutral-300 space-y-1 pl-2">
              {analysis.weaknesses.map((item, i) => <li key={`weakness-${i}`}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 flex items-center gap-2 mb-1"><Wrench size={16} /> Sugestões</h4>
            <ul className="list-disc list-inside text-neutral-300 space-y-1 pl-2">
              {analysis.suggestions.map((item, i) => <li key={`suggestion-${i}`}>{item}</li>)}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Se não houver análise, mostra o botão para iniciar
  return (
    <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-primary/10 rounded-full border border-primary/30 mb-4">
                <Bot className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-100">Análise com IA</h3>
            <p className="text-sm text-neutral-400 mt-1 mb-4">Receba sugestões e descubra os pontos fortes e fracos do seu deck.</p>
            <Button onClick={handleAnalysis} disabled={isAnalyzing} className="bg-primary text-primary-foreground">
                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A analisar...</> : <><Sparkles className="mr-2 h-4 w-4" /> Analisar Deck</>}
            </Button>
        </CardContent>
    </Card>
  );
}
