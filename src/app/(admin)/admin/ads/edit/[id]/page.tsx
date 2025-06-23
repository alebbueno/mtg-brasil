import { checkUserRole } from "@/lib/auth";
import { createClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditAdForm from "../../components/EditAdForm"; // Reutilizamos o mesmo formulário
import { updateAdSlot } from "@/app/actions/adActions"; // Importamos a action de ATUALIZAR

// Tipo para as props da página, para evitar o erro de build do Next.js
interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditAdSlotPage(props: any) {
  const { params } = props as PageProps;

  // 1. Segurança: Garante que apenas admins podem acessar
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  // 2. Busca os dados do slot de anúncio específico que queremos editar
  const supabase = createClient();
  const { data: adSlot } = await supabase
    .from('ad_slots')
    .select('*')
    .eq('id', params.id)
    .single();

  // Se o slot com este ID não for encontrado, mostra a página 404
  if (!adSlot) {
    notFound();
  }
  
  // 3. Prepara a server action `updateAdSlot`, passando o ID do post
  // O 'null' é um placeholder para o argumento 'prevState' que o React injeta.
  const updateAdSlotWithId = updateAdSlot.bind(null, adSlot.id);

  return (
    <div>
      <Link href="/admin/ads" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4">
          <ArrowLeft size={16} />
          Voltar para a lista de slots
      </Link>
      
      {/* 4. Renderiza o formulário, passando a action de UPDATE e os DADOS INICIAIS */}
      <EditAdForm formAction={updateAdSlotWithId} adSlot={adSlot} />
    </div>
  );
}