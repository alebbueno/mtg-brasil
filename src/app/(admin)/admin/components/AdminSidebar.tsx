/* eslint-disable no-undef */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Trophy, 
  PanelLeftClose, 
  PanelLeftOpen,
  LayoutDashboard,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Usuários', icon: Users },
    { href: '/admin/feedback', label: 'Feedbacks', icon: Users },
    { href: '/admin/decks', label: 'Decks Públicos', icon: FileText },
    { href: '/admin/blog', label: 'Posts', icon: MessageSquare },
    { href: '/admin/meta', label: 'Decks Meta', icon: Trophy },
  ];

  return (
    <aside className={cn(
      "bg-neutral-900 border-r border-neutral-800 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b border-neutral-800 flex items-center justify-center">
        <Link href="/admin">
          <h1 className={cn( "font-bold text-xl text-amber-500 transition-opacity whitespace-nowrap", isCollapsed ? "opacity-0 w-0" : "opacity-100" )}>
            Admin
          </h1>
          <LayoutDashboard className={cn("h-6 w-6 text-amber-500", !isCollapsed && "hidden")} />
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
          return (
            <Link key={item.href} href={item.href} title={item.label}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  "hover:bg-neutral-800 hover:text-amber-400",
                  isActive ? "bg-amber-500/10 text-amber-400" : "text-neutral-300",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-amber-400")} />
                <span className={cn( "transition-opacity duration-200", isCollapsed ? "opacity-0 w-0" : "opacity-100" )}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800 space-y-2">
        <Link href="/" title="Voltar ao Site">
          <div className={cn( "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-amber-400", isCollapsed && "justify-center" )}>
            <Home className="h-5 w-5 flex-shrink-0" />
            <span className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0" : "opacity-100")}>
              Voltar ao Site
            </span>
          </div>
        </Link>
        <Button 
          variant="outline" 
          className="w-full justify-center" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <span className="sr-only">Recolher/Expandir Menu</span>
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
      </div>
    </aside>
  );
}