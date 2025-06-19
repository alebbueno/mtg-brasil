// app/components/home/FeatureCard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-neutral-800 border-neutral-700 text-center p-6 hover:shadow-xl hover:border-amber-500 transition flex flex-col">
      <CardHeader className="items-center pb-4">
        <div className="p-3 rounded-full bg-neutral-700 mb-3 w-fit">
          {icon}
        </div>
        <CardTitle className="text-xl text-amber-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow"> {/* flex-grow para igualar altura se necessário */}
        <CardDescription className="text-neutral-300">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}