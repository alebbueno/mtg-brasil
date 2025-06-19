import { Accordion } from "@/components/ui/accordion";
import TermDefinition from "@/app/(site)/components/glossary/TermDefinition";
import { Metadata } from 'next';
import glossaryTerms from '@/app/(site)/data/glossaryTerms.json';

export const metadata: Metadata = {
  title: 'Glossário de Termos | MTG Translate',
  description: 'Entenda os termos e palavras-chave do Magic: The Gathering com explicações detalhadas.',
};

interface TranslatedTerm {
  original: string;
  translated: string;
  definition: string;
}

export default async function GlossaryPage() {
  const allTranslatedTerms: TranslatedTerm[] = glossaryTerms.terms.sort((a, b) =>
    a.translated.localeCompare(b.translated, 'pt-BR')
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-8 px-4 md:px-6">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-amber-500 mb-3">
            Glossário do Magic
          </h1>
          <p className="text-lg text-neutral-300">
            Desvende o significado das palavras-chave e habilidades do multiverso.
          </p>
        </header>

        {allTranslatedTerms.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {allTranslatedTerms.map((termData) => (
              <TermDefinition
                key={termData.original}
                displayTerm={termData.translated}
                apiTerm={termData.original}
                definition={termData.definition}
              />
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-neutral-400 py-10">
            <p>Não foi possível carregar os termos do glossário no momento.</p>
            <p>Por favor, tente novamente mais tarde.</p>
          </div>
        )}

        <aside className="mt-12 p-6 bg-neutral-900/70 rounded-lg border border-neutral-700/50">
          <h3 className="text-xl font-semibold text-amber-300 mb-3">Como usar o Glossário:</h3>
          <p className="text-neutral-400 text-sm">
            Clique em um termo da lista para expandir e ver sua explicação detalhada em português.
            Todas as definições são pré-carregadas para uma experiência rápida e offline.
          </p>
          <p className="text-neutral-500 text-xs mt-4">
            As definições são fornecidas por uma Inteligência Artificial e podem requerer interpretação
            adicional para casos de regras muito específicos. Consulte sempre o Comprehensive Rules
            para informações oficiais.
          </p>
        </aside>
      </div>
    </div>
  );
}