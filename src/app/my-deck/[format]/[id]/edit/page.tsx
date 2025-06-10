// app/my-deck/[format]/[id]/edit/page.tsx
import { notFound } from "next/navigation";

type Params = {
  id: string;
  format: string;
};

type Props = {
  params: Params;
};

export default async function DeckEditPage({ params }: Props) {
  if (!params.id || !params.format) {
    notFound();
  }

  return (
    <div>
      Editar Deck {params.id} no formato {params.format}
    </div>
  );
}
