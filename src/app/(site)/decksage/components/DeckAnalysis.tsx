import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText } from "lucide-react";

interface DeckAnalysisProps {
  deckCheck: {
    playstyle?: string;
    win_condition?: string;
    difficulty?: string;
    strengths?: string[];
    weaknesses?: string[];
  } | null;
}

export default function DeckAnalysis({ deckCheck }: DeckAnalysisProps) {
  if (!deckCheck) return null;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpenText size={20}/> Análise Estratégica (Deck Check)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
            <div className="p-3 bg-neutral-950 rounded-md border border-neutral-800">
                <p className="font-semibold text-amber-400 mb-1">Estilo de Jogo</p>
                <p className="text-neutral-300">{deckCheck.playstyle ?? 'N/A'}</p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-md border border-neutral-800">
                <p className="font-semibold text-amber-400 mb-1">Condição de Vitória</p>
                <p className="text-neutral-300">{deckCheck.win_condition ?? 'N/A'}</p>
            </div>
            <div className="p-3 bg-neutral-950 rounded-md border border-neutral-800">
                <p className="font-semibold text-amber-400 mb-1">Nível de Dificuldade</p>
                <p className="text-neutral-300">{deckCheck.difficulty ?? 'N/A'}</p>
            </div>
        </div>
        <div className="space-y-4">
             <div className="p-3 bg-neutral-950 rounded-md border border-neutral-800 h-full">
                <p className="font-semibold text-green-400 mb-1">Pontos Fortes</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1">
                    {deckCheck.strengths?.map((item, i) => <li key={i}>{item}</li>) ?? <li>N/A</li>}
                </ul>
            </div>
             <div className="p-3 bg-neutral-950 rounded-md border border-neutral-800 h-full">
                <p className="font-semibold text-red-400 mb-1">Pontos Fracos</p>
                <ul className="list-disc list-inside text-neutral-300 space-y-1">
                    {deckCheck.weaknesses?.map((item, i) => <li key={i}>{item}</li>) ?? <li>N/A</li>}
                </ul>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}