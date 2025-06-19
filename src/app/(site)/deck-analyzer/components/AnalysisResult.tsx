import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface DeckAnalysisResult {
  bracket?: number;
  powerLevel?: string;
  explanation: string;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  error?: string;
}

interface AnalysisResultProps {
  result: DeckAnalysisResult | null;
  loading: boolean;
}

export default function AnalysisResult({ result, loading }: AnalysisResultProps) {
  if (loading) {
    return (
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <Skeleton className="h-6 w-48 bg-neutral-600" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-neutral-600" />
          <Skeleton className="h-4 w-3/4 bg-neutral-600" />
          <Skeleton className="h-4 w-1/2 bg-neutral-600" />
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card className="bg-neutral-800 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Resultado da Análise
          {result.bracket && (
            <Badge className="bg-blue-600 text-white">Bracket {result.bracket}</Badge>
          )}
          {result.powerLevel && (
            <Badge className="bg-blue-600 text-white">{result.powerLevel}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.error ? (
          <p className="text-red-500">{result.error}</p>
        ) : (
          <>
            <p className="text-neutral-200">{result.explanation}</p>
            {result.strengths && (
              <div>
                <h3 className="text-lg font-semibold text-green-400">Forças</h3>
                <ul className="list-disc pl-5 text-neutral-300">
                  {result.strengths.map((strength, i) => (
                    <li key={i}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.weaknesses && (
              <div>
                <h3 className="text-lg font-semibold text-red-400">Fraquezas</h3>
                <ul className="list-disc pl-5 text-neutral-300">
                  {result.weaknesses.map((weakness, i) => (
                    <li key={i}>{weakness}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.suggestions && (
              <div>
                <h3 className="text-lg font-semibold text-blue-400">Sugestões de Melhorias</h3>
                <ul className="list-disc pl-5 text-neutral-300">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}