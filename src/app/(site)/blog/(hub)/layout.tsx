/* eslint-disable no-undef */
// app/(site)/blog/layout.tsx

import { createClient } from "@/app/utils/supabase/server";
import { Star, Tag, Search } from "lucide-react";
import Link from "next/link";

// Componente da Sidebar
async function BlogSidebar() {
    const supabase = createClient();

    // Busca os dados para a sidebar
    const categoriesPromise = supabase.from('categories').select('name, slug').limit(10);
    const popularPostsPromise = supabase.from('posts')
        .select('title, slug')
        .eq('status', 'published')
        .order('view_count', { ascending: false, nullsFirst: false })
        .limit(5);
        
    const [{ data: categories }, { data: popularPosts }] = await Promise.all([
        categoriesPromise,
        popularPostsPromise
    ]);

    return (
        <aside className="w-full lg:w-1/4 lg:pl-8 space-y-8">
            {/* Busca */}
            <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                <h3 className="font-bold text-lg text-amber-500 mb-2 flex items-center gap-2"><Search size={20}/> Buscar</h3>
                {/* O formulário de busca pode ser um Client Component no futuro */}
                <input type="text" placeholder="Buscar artigos..." className="w-full p-2 rounded bg-neutral-800 border-neutral-700 focus:ring-amber-500 focus:border-amber-500" />
            </div>

            {/* Categorias */}
            <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                <h3 className="font-bold text-lg text-amber-500 mb-2 flex items-center gap-2"><Tag size={20}/> Categorias</h3>
                <ul className="space-y-1 text-sm">
                    {categories?.map(cat => (
                        <li key={cat.slug}>
                            <Link href={`/blog/category/${cat.slug}`} className="text-neutral-300 hover:text-amber-400 transition-colors block p-1 rounded">
                                {cat.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Posts Populares */}
            <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                <h3 className="font-bold text-lg text-amber-500 mb-2 flex items-center gap-2"><Star size={20}/> Mais Lidos</h3>
                <ul className="space-y-2 text-sm">
                    {popularPosts?.map(post => (
                         <li key={post.slug}>
                            <Link href={`/blog/${post.slug}`} className="text-neutral-300 hover:text-amber-400 transition-colors block p-1 rounded">
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}


export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8 sm:py-16 px-4">
        <div className="flex flex-col lg:flex-row gap-12">
            <main className="w-full lg:w-3/4">
                {children}
            </main>
            <BlogSidebar />
        </div>
    </div>
  );
}