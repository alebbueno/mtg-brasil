// app/admin/blog/new/page.tsx
import PostForm from '../components/PostForm'; // Importa o formulário que criamos
import { checkUserRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewPostPage() {
  // Segurança: Garante que apenas admins podem ver esta página.
  // Esta verificação acontece no servidor antes de qualquer coisa ser renderizada.
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  return (
    // O layout principal do admin (app/(admin)/layout.tsx) já fornece o padding e a estrutura geral.
    // Portanto, este componente só precisa se preocupar com seu próprio conteúdo.
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <Link 
          href="/admin/blog" 
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Voltar para a lista de artigos
        </Link>
        <h1 className="text-3xl font-bold text-amber-500">
          Criar Novo Artigo
        </h1>
        <p className="text-neutral-400 mt-1">
          Preencha os campos abaixo para criar um novo post no blog.
        </p>
      </header>

      {/* Renderiza o componente de formulário, que é um Client Component e contém toda a interatividade. */}
      <PostForm />
    </div>
  );
}