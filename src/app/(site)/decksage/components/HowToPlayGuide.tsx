'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface HowToPlayGuideProps {
  guideText: string | null;
}

export default function HowToPlayGuide({ guideText }: HowToPlayGuideProps) {
  if (!guideText) return null;
  
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit size={20}/> Guia de Como Jogar
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* A classe 'prose' vem do plugin @tailwindcss/typography para estilizar o markdown */}
        <div className="prose prose-sm prose-invert max-w-none prose-headings:text-amber-400 prose-strong:text-white prose-p:text-neutral-300 prose-li:text-neutral-300">
          <ReactMarkdown>{guideText}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}