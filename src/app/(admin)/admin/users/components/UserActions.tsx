'use client'

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, // Usando o item de menu correto
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, Shield, ShieldOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { updateUserStatus } from '@/app/actions/adminActions';
import { toast } from 'sonner';

type UserActionsProps = {
  user: {
    id: string;
    username: string | null;
    status: string;
  }
}

export default function UserActions({ user }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = () => {
    startTransition(async () => {
      const newStatus = user.status === 'active' ? 'blocked' : 'active';
      const result = await updateUserStatus(user.id, newStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-neutral-200" align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/profile/${user.username || user.id}`} target="_blank">
            <User className="mr-2 h-4 w-4" />
            Ver Perfil Público
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-neutral-700" />
        
        {/* AJUSTE: Corrigido de <ContextMenuItem> para <DropdownMenuItem> */}
        <DropdownMenuItem
          onSelect={handleStatusChange}
          className="cursor-pointer text-orange-400 focus:text-orange-400 focus:bg-neutral-800"
        >
          {user.status === 'active' ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4" />
              <span>Bloquear Usuário</span>
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              <span>Desbloquear Usuário</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}