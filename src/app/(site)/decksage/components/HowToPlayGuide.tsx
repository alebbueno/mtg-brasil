/* eslint-disable no-undef */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { BrainCircuit, BookCopy, Dices, Hourglass, Swords, Gem, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface HowToPlayGuideProps {
  guideText: string | null;
}

const sectionIcons: Record<string, React.ReactElement> = {
  "Visão Geral da Estratégia": <BookCopy className="h-5 w-5 text-amber-400" />,
  "Postura de Mulligan": <Dices className="h-5 w-5 text-amber-400" />,
  "Jogo Inicial (Turnos 1-3)": <Hourglass className="h-5 w-5 text-amber-400" />,
  "Meio de Jogo (Turnos 4-6)": <Swords className="h-5 w-5 text-amber-400" />,
  "Fim de Jogo (Turnos 7+)": <Gem className="h-5 w-5 text-amber-400" />,
  "Dicas e Sinergias": <Sparkles className="h-5 w-5 text-amber-400" />,
};

const parseGuide = (text: string): { title: string; content: string }[] => {
  if (!text) return [];
  const sections = text.trim().split(/\n(?=###\s)/);
  return sections.map(section => {
    const cleanSection = section.replace(/^###\s/, '').trim();
    const lines = cleanSection.split('\n');
    const title = lines.shift() || 'Seção';
    const content = lines.join('\n').trim();
    return { title, content };
  }).filter(section => section.title && section.content);
};

export default function HowToPlayGuide({ guideText }: HowToPlayGuideProps) {
  if (!guideText) return null;
  
  const guideSections = parseGuide(guideText);
  const defaultValue = guideSections.length > 0 ? [guideSections[0].title] : [];

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BrainCircuit size={20}/> Guia de Como Jogar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={defaultValue} className="w-full">
          {guideSections.map((section, index) => (
            <AccordionItem key={index} value={section.title}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  {sectionIcons[section.title] || <BookCopy className="h-5 w-5 text-amber-400" />}
                  <span className="font-semibold text-base text-neutral-100">{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {/* AJUSTE: 
                  - Removido 'prose-sm' para usar o tamanho de fonte base (16px).
                  - Adicionado 'prose-p:leading-relaxed' para aumentar o espaçamento entre as linhas dos parágrafos.
                */}
                <div className="prose prose-base prose-invert max-w-none prose-headings:text-amber-400 prose-strong:text-white prose-p:text-neutral-300 prose-p:leading-relaxed prose-li:text-neutral-300">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}