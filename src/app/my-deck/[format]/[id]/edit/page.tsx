/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/my-deck/[format]/[id]/edit/page.tsx
import { notFound } from 'next/navigation';

export default async function DeckEditPage({ params }: { params: { format: string; id: string } }) {
  // Só pra teste, vamos garantir que o formato está correto
  console.log('params:', params);

  // Simule uma condição pra testar notFound()
  if (!params.id) {
    notFound();
  }

  return <div>Editar deck {params.id} no formato {params.format}</div>;
}
