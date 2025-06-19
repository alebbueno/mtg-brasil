/* eslint-disable no-undef */
import { checkUserRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import AdminSidebar from './admin/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Segurança em nível de layout: protege todas as rotas dentro de /admin/*
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}