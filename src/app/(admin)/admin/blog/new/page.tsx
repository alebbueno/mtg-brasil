import PostForm from '../components/PostForm';
import { checkUserRole } from '@/lib/auth';
import { createPost } from '@/app/actions/postActions';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewPostPage() {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  const supabase = createClient();
  const { data: allCategories } = await supabase.from('categories').select('*').order('name', { ascending: true });

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4">
          <ArrowLeft size={16} />
          Voltar para a lista de artigos
        </Link>
        <h1 className="text-3xl font-bold text-amber-500">Criar Novo Artigo</h1>
        <p className="text-neutral-400 mt-1">Preencha os campos abaixo para criar um novo post no blog.</p>
      </header>
      
      <PostForm 
        formAction={createPost}
        allCategories={allCategories || []}
      />
    </div>
  );
}