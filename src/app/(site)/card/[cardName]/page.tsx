/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// import Link from "next/link";
// import { notFound } from "next/navigation";
import { fetchCardByName } from "@/app/lib/scryfall";
import { ScryfallCard } from "@/app/lib/types";
// import { Button } from "@/components/ui/button";
import { translateCardText } from "@/app/actions/aiActions";

import CardDetailPageLayout from "../components/CardDetailPageLayout";
import CardImageDisplay from "../components/CardImageDisplay";
import CardDetailsDisplay from "../components/CardDetailsDisplay";
import CardHeaderInfo from "../components/CardHeaderInfo";
import CardTypeLine from "../components/CardTypeLine";
import CardOracleText from "../components/CardOracleText";
import CardFlavorText from "../components/CardFlavorText";
import CardPowerToughness from "../components/CardPowerToughness";
import CardRaritySetInfo from "../components/CardRaritySetInfo";
import { Separator } from "@/components/ui/separator";
import CardTextDisplay from "../components/CardTextDisplay";

interface PageProps {
  params: { cardName: string };
}

export async function generateMetadata(props: any) {
  const { params } = props as PageProps;
  const decodedCardName = decodeURIComponent(params.cardName);
  try {
    const card = await fetchCardByName(decodedCardName);
    return {
      title: `${card.name} | MTG Deck Builder`,
      description: card.oracle_text || `Detalhes e tradução da carta de Magic: The Gathering: ${card.name}.`,
      openGraph: {
        title: card.name,
        description: card.oracle_text || `Detalhes da carta ${card.name}`,
        images: [card.image_uris?.art_crop || card.image_uris?.normal || ''],
      },
    };
  } catch (error) {
    return {
      title: "Carta não encontrada",
      description: "Nenhuma carta encontrada com o nome fornecido.",
    };
  }
}

export default async function CardPage(props: any) {
  const { params } = props as PageProps;
  const decodedCardName = decodeURIComponent(params.cardName);

  let card: ScryfallCard;
  try {
    card = await fetchCardByName(decodedCardName);
  } catch (error) {
    console.error("Erro ao buscar carta:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
        {/* ... (mesmo código de carta não encontrada) ... */}
      </div>
    );
  }

  const isDoubleFaced = Array.isArray(card.card_faces) && card.card_faces.length > 0;
  const displayCard = isDoubleFaced ? card.card_faces?.[0] : card;
  const backCard = isDoubleFaced ? card.card_faces?.[1] : null;

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
            {/* AJUSTE: Usamos o novo componente interativo aqui */}
            <CardTextDisplay
              originalText={displayCard?.oracle_text}
              translatedText={translatedOracleText}
            />

            {/* <CardOracleText oracleText={translatedOracleText} /> */}
            <CardFlavorText flavorText={displayCard?.flavor_text} />
            <CardPowerToughness power={displayCard?.power} toughness={displayCard?.toughness} />
            <CardRaritySetInfo rarity={displayCard?.rarity} setName={displayCard?.set_name} />

            {isDoubleFaced && backCard && (
              <>
                <Separator className="bg-amber-500/50 my-8" />
                <CardHeaderInfo name={backCard.name} manaCost={backCard.mana_cost} />
                <CardTypeLine typeLine={backCard.type_line} />
                <Separator className="bg-neutral-700 my-4" />
                <CardOracleText oracleText={translatedBackOracleText} />
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