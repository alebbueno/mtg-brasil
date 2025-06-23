/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-undef */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ScryfallCard } from "@/app/lib/types";
import { fetchCardById } from "@/app/lib/scryfall"; // AJUSTE: Usa a busca por ID
import { translateCardText } from "@/app/actions/aiActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// AJUSTE: Imports dos novos componentes de layout
import CardDetailPageLayout from "../../components/CardDetailPageLayout";
import CardImageDisplay from "../../components/CardImageDisplay";
import CardDetailsDisplay from "../../components/CardDetailsDisplay";
import CardHeaderInfo from "../../components/CardHeaderInfo";
import CardTypeLine from "../../components/CardTypeLine";
import CardOracleText from "../../components/CardOracleText";
import CardFlavorText from "../../components/CardFlavorText";
import CardPowerToughness from "../../components/CardPowerToughness";
import CardRaritySetInfo from "../../components/CardRaritySetInfo";
import CardTextDisplay from "../../components/CardTextDisplay";

interface PageProps {
  params: { cardId: string };
}

export async function generateMetadata({ params }: any) {
  const { cardId } = (params || {}) as { cardId: string };
  if (!cardId) return { title: "Carta" };
  
  try {
    const card = await fetchCardById(cardId);
    return {
      title: `${card.name} | MTG Deck Builder`,
      description: card.oracle_text || `Detalhes da carta de Magic: ${card.name}.`,
    };
  } catch (error) {
    return { title: "Carta não encontrada" };
  }
}

export default async function CardByIdPage(props: any) {
  const { params } = props as PageProps;

  let card: ScryfallCard;
  try {
    // AJUSTE: A busca inicial agora é por ID com fetchCardById
    card = await fetchCardById(params.cardId);
  } catch (error) {
    console.error("Erro ao buscar carta por ID:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white p-6">
        <Card className="w-full max-w-md bg-neutral-900 border-neutral-800 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-500">Carta não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-6">Nenhuma carta encontrada com o ID fornecido.</p>
            <Link href="/"><Button>Voltar para a busca</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // A lógica de tradução e exibição agora é idêntica à da outra página
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

  // AJUSTE: O JSX de retorno agora usa a nova estrutura de componentes
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