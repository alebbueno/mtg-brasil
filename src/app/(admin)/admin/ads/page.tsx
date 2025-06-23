import { checkUserRole } from '@/lib/auth';
import { createClient } from '@/app/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminAdsPage() {
  const isAdmin = await checkUserRole('admin');
  if (!isAdmin) notFound();

  const supabase = createClient();
  const { data: adSlots } = await supabase.from('ad_slots').select('*').order('slot_name');

  return (
    <>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">Gerenciar Anúncios</h1>
          <p className="text-neutral-400 mt-1">
            Configure os espaços de anúncio do seu site.
          </p>
        </div>
        <Link href="/admin/ads/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Slot
          </Button>
        </Link>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700 hover:bg-neutral-900">
              <TableHead className="text-white">Slot</TableHead>
              <TableHead className="text-white">Tipo</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-right text-white">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adSlots && adSlots.length > 0 ? (
              adSlots.map((slot) => (
                <TableRow key={slot.id} className="border-neutral-800">
                  <TableCell className="font-mono text-neutral-200">{slot.slot_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{slot.ad_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={slot.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                      {slot.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/ads/edit/${slot.id}`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center text-neutral-500 py-10">Nenhum slot de anúncio encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}