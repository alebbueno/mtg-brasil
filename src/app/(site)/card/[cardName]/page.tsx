/* eslint-disable no-console */
import { fetchCardByName } from "@/app/lib/scryfall";
import { translateCardText } from "@/app/actions/aiActions";
import CardDetailPageLayout from "../components/CardDetailPageLayout";
import CardImageDisplay from "../components/CardImageDisplay";
import CardDetailsDisplay from "../components/CardDetailsDisplay";
import CardHeaderInfo from "../components/CardHeaderInfo";
import CardTypeLine from "../components/CardTypeLine";
import { Separator } from "@/components/ui/separator";
import CardTextDisplay from "../components/CardTextDisplay";

interface PageProps {
  params: Promise<{ cardName: string }>;
}

export default async function CardPage(props: PageProps) {
  const resolvedParams = await props.params;
  const decodedCardName = decodeURIComponent(resolvedParams.cardName);

  const card = await fetchCardByName(decodedCardName);

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <h1 className="text-xl">Carta não encontrada: {decodedCardName}</h1>
      </div>
    );
  }

  const isDoubleFaced = Array.isArray(card.card_faces) && card.card_faces.length > 0;
  const displayCard = isDoubleFaced ? card.card_faces?.[0] : card;
  const backCard = isDoubleFaced ? card.card_faces?.[1] : null;

  // Tradução
  let translatedText = '';
  if (displayCard?.oracle_text) {
    const res = await translateCardText(card.id, displayCard.name, displayCard.oracle_text);
    translatedText = res.translatedText || displayCard.oracle_text;
  }

  return (
    <CardDetailPageLayout>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <CardImageDisplay 
            imageUrl={displayCard?.image_uris?.normal} 
            altText={displayCard?.name || ''} 
          />
        </div>
        <div className="md:col-span-3">
          <CardDetailsDisplay>
            <CardHeaderInfo name={displayCard?.name || ''} manaCost={displayCard?.mana_cost} />
            <CardTypeLine typeLine={displayCard?.type_line} />
            <Separator className="my-4 bg-neutral-700" />
            <CardTextDisplay 
              originalText={displayCard?.oracle_text} 
              translatedText={translatedText} 
            />
          </CardDetailsDisplay>
        </div>
      </div>
    </CardDetailPageLayout>
  );
}