import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  Icon: LucideIcon;
}

export default function StatCard({ title, value, description, Icon }: StatCardProps) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 hover:border-amber-500/50 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-300">{title}</CardTitle>
        <Icon className="h-5 w-5 text-neutral-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-neutral-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}