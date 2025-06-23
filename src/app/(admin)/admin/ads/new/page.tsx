import { checkUserRole } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditAdForm from "../components/EditAdForm"; // Reutilizamos o mesmo formulário
import { createAdSlot } from "@/app/actions/adActions"; // Importamos a nova action de criar

export default async function NewAdSlotPage() {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();
  
  return (
    <div>
      <Link href="/admin/ads" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4">
          <ArrowLeft size={16} />
          Voltar para a lista de slots
      </Link>
      {/* Passamos a action de CRIAR e NÃO passamos dados iniciais */}
      <EditAdForm formAction={createAdSlot} />
    </div>
  );
}