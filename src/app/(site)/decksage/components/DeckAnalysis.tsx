/* eslint-disable no-undef */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenText, ThumbsUp, ThumbsDown, Trophy, BarChart3, Swords } from "lucide-react";

interface DeckAnalysisProps {
  deckCheck: {
    playstyle?: string;
    win_condition?: string;
    difficulty?: string;
    strengths?: string[];
    weaknesses?: string[];
  } | null;
}

const DifficultyMeter = ({ level }: { level: string }) => {
    const levels = ['Fácil', 'Médio', 'Difícil'];
    const currentLevelIndex = levels.indexOf(level);
    const levelColors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];
    return (
        <div className="flex gap-1.5 mt-1">
            {Array.from({ length: 3 }).map((_, index) => ( <div key={index} className={`h-2 w-full rounded-full ${index <= currentLevelIndex ? levelColors[currentLevelIndex] : 'bg-neutral-700'}`} /> ))}
        </div>
    )
};

const StatCard = ({ title, value, Icon }: { title: string, value: string, Icon: React.ElementType }) => (
    <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-2 text-neutral-400 text-sm font-semibold mb-1">
            <Icon className="h-4 w-4" />
            <span>{title}</span>
        </div>
        <p className="text-neutral-100 font-bold text-base truncate">{value}</p>
    </div>
);

export default function DeckAnalysis({ deckCheck }: DeckAnalysisProps) {
  if (!deckCheck) return null;

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpenText size={20}/> Análise Estratégica (Deck Check)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Estilo de Jogo" value={deckCheck.playstyle ?? 'N/A'} Icon={Swords} />
            <StatCard title="Condição de Vitória" value={deckCheck.win_condition ?? 'N/A'} Icon={Trophy} />
            <div>
                <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 h-full">
                    <div className="flex items-center gap-2 text-neutral-400 text-sm font-semibold mb-1"><BarChart3 className="h-4 w-4" /><span>Dificuldade</span></div>
                    <p className="text-neutral-100 font-bold text-base">{deckCheck.difficulty ?? 'N/A'}</p>
                    {deckCheck.difficulty && <DifficultyMeter level={deckCheck.difficulty} />}
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-900/10 rounded-lg border border-green-500/20 space-y-2">
                <h4 className="font-semibold text-green-400 flex items-center gap-2"><ThumbsUp size={16} /> Pontos Fortes</h4>
                {/* AJUSTE: Aumentado o tamanho da fonte e o espaçamento entre linhas */}
                <ul className="list-disc list-inside text-neutral-200 text-base space-y-1 leading-relaxed">
                    {deckCheck.strengths && deckCheck.strengths.length > 0 ? deckCheck.strengths.map((item, i) => <li key={i}>{item}</li>) : <li>N/A</li>}
                </ul>
            </div>
            <div className="p-4 bg-red-900/10 rounded-lg border border-red-500/20 space-y-2">
                <h4 className="font-semibold text-red-400 flex items-center gap-2"><ThumbsDown size={16} /> Pontos Fracos</h4>
                 {/* AJUSTE: Aumentado o tamanho da fonte e o espaçamento entre linhas */}
                <ul className="list-disc list-inside text-neutral-200 text-base space-y-1 leading-relaxed">
                    {deckCheck.weaknesses && deckCheck.weaknesses.length > 0 ? deckCheck.weaknesses.map((item, i) => <li key={i}>{item}</li>) : <li>N/A</li>}
                </ul>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}