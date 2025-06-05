import * as fs from 'fs/promises';
import * as path from 'path';

interface ScryfallCatalog {
  data: string[];
}

console.log(`Executando com Node.js v${process.version}`);

async function fetchMtgTerms(catalogType: 'keyword-abilities' | 'ability-words'): Promise<string[]> {
  try {
    const response = await fetch(`https://api.scryfall.com/catalog/${encodeURIComponent(catalogType)}`);
    if (!response.ok) {
      console.error(`Erro ao buscar ${catalogType}: ${response.statusText} (Status: ${response.status})`);
      return [];
    }
    const catalog: ScryfallCatalog = await response.json();
    return catalog.data;
  } catch (error) {
    console.error(`Falha ao buscar ${catalogType}:`, error);
    return [];
  }
}

async function translateText(text: string, type: 'keyword_en_to_pt' | 'definition_en_to_pt'): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`Chamando API: ${apiUrl}/api/translate para ${type}`); // Debug log
    const response = await fetch(`${apiUrl}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type }),
    });
    if (!response.ok) {
      console.warn(`Falha ao traduzir "${text}" (${type}): ${response.status}`);
      return text;
    }
    const data = await response.json();
    return data?.translation || text;
  } catch (error) {
    console.error(`Erro ao traduzir "${text}" (${type}):`, error);
    return text;
  }
}

async function fetchDefinition(term: string): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`Chamando API: ${apiUrl}/src/api/glossary?term=${term}`); // Debug log
    const response = await fetch(`${apiUrl}/src/api/glossary?term=${encodeURIComponent(term)}`);
    if (!response.ok) {
      console.warn(`Falha ao buscar definição para "${term}": ${response.status}`);
      return '';
    }
    const data = await response.json();
    return data?.definition || '';
  } catch (error) {
    console.error(`Erro ao buscar definição para "${term}":`, error);
    return '';
  }
}

async function generateGlossary() {
  try {
    const keywordAbilities = await fetchMtgTerms('keyword-abilities');
    const abilityWords = await fetchMtgTerms('ability-words');
    const allTerms = Array.from(new Set([...keywordAbilities, ...abilityWords])).sort();

    console.log(`Processando ${allTerms.length} termos...`);

    const translatedTerms = await Promise.all(
      allTerms.map(async (term) => {
        const translatedTerm = await translateText(term, 'keyword_en_to_pt');
        const definitionEn = await fetchDefinition(term);
        const translatedDefinition = definitionEn
          ? await translateText(definitionEn, 'definition_en_to_pt')
          : '';
        return {
          original: term,
          translated: translatedTerm,
          definition: translatedDefinition,
        };
      })
    );

    const output = { terms: translatedTerms };
    const outputPath = path.join(process.cwd(), 'app/data/glossaryTerms.json');
    await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`Arquivo gerado com sucesso: ${outputPath}`);
  } catch (error) {
    console.error('Erro ao gerar glossário:', error);
    throw error;
  }
}

generateGlossary().catch((error) => {
  console.error('Erro ao executar o script:', error);
  process.exit(1);
});