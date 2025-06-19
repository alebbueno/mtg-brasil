'use client'; // Gráficos interativos precisam ser componentes de cliente

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

interface ChartData {
  date: string;
  total: number;
}

export default function UsersChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle>Novos Usuários</CardTitle>
        <CardDescription>Novos usuários cadastrados nos últimos 7 dias.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#a3a3a3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#a3a3a3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: '#404040', radius: 4 }}
              contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', color: '#f5f5f5' }}
            />
            <Bar dataKey="total" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}