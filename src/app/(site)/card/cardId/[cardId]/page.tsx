// src/app/(site)/card/cardId/[cardId]/page.tsx

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */

import { fetchCardById } from "@/app/lib/scryfall";
import { ScryfallCard } from "@/app/lib/types"; 
import { translateCardText } from "@/app/actions/aiActions";

import CardDetailPageLayout from "../../components/CardDetailPageLayout";
import CardImageDisplay from "../../components/CardImageDisplay";
import CardDetailsDisplay from "../../components/CardDetailsDisplay";
import CardHeaderInfo from "../../components/CardHeaderInfo";
import CardTypeLine from "../../components/CardTypeLine";
import CardTextDisplay from "../../components/CardTextDisplay";
import CardFlavorText from "../../components/CardFlavorText";
import CardPowerToughness from "../../components/CardPowerToughness";
import CardRaritySetInfo from "../../components/CardRaritySetInfo";
import { Separator } from "@/components/ui/separator";

// No Next.js 15+, params é uma Promise
interface PageProps {
  params: Promise<{ cardId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const cardId = resolvedParams.cardId ?? '';

  if (!cardId) return { title: "Carta não especificada" };
    
  try {
    const card = await fetchCardById(cardId);
    
    if (!card) {
      return { title: "Carta não encontrada" };
    }

    return {
      title: `${card.name} | MTG Deck Builder`,
      description: card.oracle_text || `Detalhes da carta ${card.name}.`,
      openGraph: {
        title: card.name,
        images: [card.image_uris?.art_crop || card.image_uris?.normal || ''],
      },
    };
  } catch (error) {
    return { title: "Erro ao carregar carta" };
  }
}

export default async function CardByIdPage({ params }: PageProps) {
  // Resolve a Promise do params para evitar erro de runtime no Next.js 15+
  const resolvedParams = await params;
  const cardId = resolvedParams.cardId ?? '';

  let card: ScryfallCard | null = null;
  let errorMsg: string | null = null;
  
  try {
    if (!cardId || cardId === "undefined") {
        errorMsg = "ID da carta não fornecido.";
    } else {
        card = await fetchCardById(cardId);
    }
  } catch (error: any) {
    console.error("Erro inesperado ao buscar carta por ID:", error);
    errorMsg = "Erro interno ao processar a requisição.";
  }
  
  // Tratamento de segurança caso a carta não exista no Scryfall
  if (!card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6">
        <h1 className="text-2xl font-bold text-red-500">Carta não encontrada</h1>
        <p className="mt-4 text-neutral-400">
          {errorMsg || `O ID ${cardId} não retornou resultados.`}
        </p>
      </div>
    );
  }
  
  // Lógica para cartas de face dupla (Transform)
  const isDoubleFaced = Array.isArray(card.card_faces) && card.card_faces.length > 0;
  const displayCard = isDoubleFaced ? card.card_faces?.[0] : card;
  const backCard = isDoubleFaced ? card.card_faces?.[1] : null;

  // Tradução com verificação automática de cache no banco de dados
  let translatedOracleText = '';
  if (displayCard?.oracle_text) {
    const result = await translateCardText(card.id, displayCard.name, displayCard.oracle_text);
    translatedOracleText = result.translatedText || displayCard.oracle_text;
  }

  let translatedBackOracleText = '';
  if (backCard?.oracle_text) {
    const result = await translateCardText(card.id, backCard.name, backCard.oracle_text);
    translatedBackOracleText = result.translatedText || backCard.oracle_text;
  }

  return (
    <CardDetailPageLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <CardImageDisplay
            imageUrl={displayCard?.image_uris?.normal}
            altText={displayCard?.name || ''}
            backImageUrl={backCard?.image_uris?.normal}
            backAltText={backCard?.name}
          />
        </div>
        <div className="lg:col-span-3">
          <CardDetailsDisplay>
            <CardHeaderInfo name={displayCard?.name || ''} manaCost={displayCard?.mana_cost} />
            <CardTypeLine typeLine={displayCard?.type_line} />
            <Separator className="bg-neutral-700 my-4" />
            
            {/* Componente que alterna entre texto original e traduzido do cache */}
            <CardTextDisplay
              originalText={displayCard?.oracle_text}
              translatedText={translatedOracleText}
            />

            <CardFlavorText flavorText={displayCard?.flavor_text} />
            <CardPowerToughness power={displayCard?.power} toughness={displayCard?.toughness} />
            <CardRaritySetInfo rarity={displayCard?.rarity} setName={displayCard?.set_name} />

            {isDoubleFaced && backCard && (
              <>
                <Separator className="bg-amber-500/50 my-8" />
                <CardHeaderInfo name={backCard.name} manaCost={backCard.mana_cost} />
                <CardTypeLine typeLine={backCard.type_line} />
                <Separator className="bg-neutral-700 my-4" />
                <CardTextDisplay
                    originalText={backCard.oracle_text}
                    translatedText={translatedBackOracleText}
                />
                <CardFlavorText flavorText={backCard.flavor_text} />
                <CardPowerToughness power={backCard.power} toughness={backCard.toughness} />
                <CardRaritySetInfo rarity={backCard.rarity} setName={backCard.set_name} />
              </>
            )}
          </CardDetailsDisplay>
        </div>
      </div>
    </CardDetailPageLayout>
  );
}