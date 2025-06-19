/* eslint-disable no-undef */
// app/(admin)/layout.tsx

import { checkUserRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import AdminSidebar from './admin/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Segurança em nível de layout (continua igual)
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  return (
    // AJUSTE: Trocamos 'min-h-screen' por 'h-screen' e adicionamos 'overflow-hidden'
    // h-screen: Trava a altura do container na altura da tela.
    // overflow-hidden: Impede que o container principal crie uma barra de rolagem.
    <div className="flex h-screen overflow-hidden bg-neutral-950 text-neutral-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {/* A classe 'overflow-y-auto' que já estava aqui agora funcionará corretamente.
          Como a altura deste <main> está limitada pelo 'h-screen' do pai,
          qualquer conteúdo que ultrapasse o limite criará uma barra de rolagem
          APENAS nesta área de conteúdo.
        */}
        {children}
      </main>
    </div>
  );
}