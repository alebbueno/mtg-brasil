import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';
import Link from 'next/link';

type PageData = {
    path: string | undefined | null;
    views: string | undefined | null;
}

export default function TopPages({ pages }: { pages: PageData[] }) {
    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-base font-medium text-neutral-300 flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-neutral-500" />
                    Páginas Mais Vistas (Últimos 7 dias)
                </CardTitle>
            </CardHeader>
            <CardContent>
                {pages.length > 0 ? (
                    <ul className="space-y-2">
                        {pages.map((page, index) => (
                            <li key={index} className="flex justify-between text-sm py-1 border-b border-neutral-800 last:border-0">
                                <Link href={page.path || '#'} target="_blank" className="truncate text-neutral-200 hover:text-amber-400" title={page.path || ''}>
                                    {page.path === '/' ? '/ (Home)' : page.path}
                                </Link>
                                <span className="font-bold">{page.views}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-neutral-500 text-center py-4">Nenhum dado de página disponível.</p>
                )}
            </CardContent>
        </Card>
    )
}