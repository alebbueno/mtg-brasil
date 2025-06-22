'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Plus, Minus } from 'lucide-react';

export default function LifeCounter({ initialLife = 40 }: { initialLife: number }) {
  const [life, setLife] = useState(initialLife);

  return (
    <Card className="bg-red-900/40 border-red-500/50 text-center">
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-medium text-red-300 flex items-center justify-center gap-2">
          <Heart size={16} />
          Vida
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 flex items-center justify-center gap-2">
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setLife(l => l - 1)}>
            <Minus size={16} />
        </Button>
        <span className="text-3xl font-bold w-12 text-center">{life}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setLife(l => l + 1)}>
            <Plus size={16} />
        </Button>
      </CardContent>
    </Card>
  );
}