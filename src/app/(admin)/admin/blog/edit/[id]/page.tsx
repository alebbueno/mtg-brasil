import { updatePost } from '@/app/actions/postActions';
import PostForm from '../../components/PostForm';
import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// O tipo das props para referência interna
interface PageProps {
  params: {
    id: string;
  };
}

// AJUSTE: Recebemos as props como 'any' e depois as convertemos para o tipo correto,
// exatamente como no seu arquivo de modelo, para resolver o erro de build.
export default async function EditPostPage(props: any) {
  // Garante que estamos a usar os parâmetros da forma correta
  const { params } = props as PageProps;
  
  // Segurança
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) {
    notFound();
  }

  // Busca os dados do post específico que queremos editar
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

  // Se o post não for encontrado, mostra a página 404
  if (!post) {
    notFound();
  }

  // Prepara a server action `updatePost`, passando o ID do post
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
      
      {/* Renderiza o formulário, passando a action de UPDATE e os dados iniciais */}
      <PostForm 
        formAction={updatePostWithId} 
        initialData={post}
        allCategories={allCategories || []}
      />
    </div>
  );
}