/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import Link from "next/link";
import { fetchCardById } from "@/app/lib/scryfall";
import CardDisplay from "@/app/(site)/components/CardDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Interface para a resposta da API do Scryfall
interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  mana_cost?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  rarity: string;
  set_name: string;
  image_uris?: {
    normal: string;
  };
  card_faces?: Array<{
    image_uris?: {
      normal: string;
    };
    name: string;
    type_line: string;
    mana_cost?: string;
    oracle_text?: string;
    power?: string;
    toughness?: string;
  }>;
}

interface Props {
  params: Promise<{ cardId: string }>;
}

// Função para traduzir o texto
async function translateText(text: string): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.log('Erro na API de tradução:', response.status, response.statusText);
      return text; // Fallback para o texto original
    }

    const { translation } = await response.json();
    return translation || text; // Retorna o texto original se a tradução for vazia
  } catch (error) {
    console.log(`Erro ao chamar a API de tradução: ${error}`);
    return text; // Fallback para o texto original
  }
}

export default async function CardPage({ params }: Props) {
  const { cardId } = await params;
  const decodedCardId = decodeURIComponent(cardId);

  let card: ScryfallCard;
  try {
    card = await fetchCardById(decodedCardId);
  } catch (error) {
    console.error("Erro ao buscar carta:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">
              Carta não encontrada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4">
              Nenhuma carta encontrada com o ID:{" "}
              <span className="font-bold">&quot;{decodedCardId}&quot;</span>
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Voltar para a busca
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determina se a carta tem faces
  const isDoubleFaced = !!(card.card_faces && card.card_faces.length > 0);
  const displayCard = isDoubleFaced ? card.card_faces![0] : card;

  // Traduz o oracle_text, se disponível
  const translatedOracleText = displayCard.oracle_text
    ? await translateText(displayCard.oracle_text)
    : '';

  const translatedBackOracleText = isDoubleFaced && card.card_faces![1]?.oracle_text
    ? await translateText(card.card_faces![1].oracle_text)
    : "";

  return (
    <CardDisplay
      card={card}
      isDoubleFaced={isDoubleFaced}
      displayCard={displayCard}
      translatedOracleText={translatedOracleText}
      translatedBackOracleText={translatedBackOracleText}
    />
  );
}

export async function generateMetadata({ params }: Props) {
  const { cardId } = await params;
  const decodedCardId = decodeURIComponent(cardId);
  try {
    const card = await fetchCardById(decodedCardId);
    return {
      title: card.name,
      description: card.oracle_text || "Carta de Magic: The Gathering",
    };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      title: "Carta não encontrada",
      description: "Nenhuma carta encontrada com o ID fornecido.",
    };
  }
}