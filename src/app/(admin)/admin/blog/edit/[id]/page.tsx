import { updatePost } from '@/app/actions/postActions';
import PostForm from '../../components/PostForm';
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  const supabase = createClient();

  const postPromise = supabase
    .from('posts')
    .select('*, categories(id)') // Pega o post e os IDs das suas categorias
    .eq('id', params.id)
    .single();
  
  const categoriesPromise = supabase.from('categories').select('*').order('name', { ascending: true });

  const [{ data: post }, { data: allCategories }] = await Promise.all([
    postPromise,
    categoriesPromise
  ]);

  if (!post) notFound();

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors mb-4">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <h1 className="text-3xl font-bold text-amber-500">Editar Artigo</h1>
        <p className="text-neutral-400 mt-1 line-clamp-1">
          A fazer alterações em: <span className="font-semibold text-neutral-200">{post.title}</span>
        </p>
      </header>
      
      <PostForm 
        formAction={updatePostWithId} 
        initialData={post}
        allCategories={allCategories || []}
      />
    </div>
  );
}