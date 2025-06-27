import { checkUserRole } from "@/lib/auth";
import { createClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";
import EditSiteDeckForm from "./components/EditSiteDeckForm";
import type { DeckFromDB } from "@/app/lib/types";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: { id: string; };
}

export default async function EditSiteDeckPage(props: any) {
    const { params } = props as PageProps;
    const isAdmin = await checkUserRole('admin');
    if (!isAdmin) notFound();

    const supabase = createClient();
    const { data: deck } = await supabase
        .from('decks')
        .select<"*", DeckFromDB>("*") // Seleciona todas as colunas
        .eq('id', params.id)
        .single();
    
    if (!deck) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <Link href="/admin/decks" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 mb-4">
                    <ArrowLeft size={16} /> Voltar para a lista
                </Link>
                <h1 className="text-3xl font-bold text-amber-500">Editando Deck do Site</h1>
                <p className="text-neutral-300 mt-1">{deck.name}</p>
            </header>
            
            <EditSiteDeckForm deck={deck} />
        </div>
    )
}