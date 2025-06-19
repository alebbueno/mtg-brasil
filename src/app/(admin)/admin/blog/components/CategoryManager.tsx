'use client'

import { useState, useTransition } from 'react';
import { createCategory } from '@/app/actions/categoryActions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

type Category = {
  id: string;
  name: string;
};

interface CategoryManagerProps {
  allCategories: Category[];
  selectedCategoryIds: Set<string>;
}

export default function CategoryManager({ allCategories, selectedCategoryIds }: CategoryManagerProps) {
  // AJUSTE: Usaremos useTransition para o estado de loading do botão de adicionar
  const [isPending, startTransition] = useTransition();
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = () => {
    // Não precisamos mais do evento do formulário
    startTransition(async () => {
      const formData = new FormData();
      formData.append('categoryName', newCategoryName);

      const result = await createCategory(formData);
      if (result.success) {
        toast.success(result.message);
        setNewCategoryName(''); // Limpa o input após o sucesso
      } else {
        toast.error(result.message || 'Ocorreu um erro.');
      }
    });
  };

  return (
    <div>
      {/* AJUSTE: O <form> foi trocado por uma <div> */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          type="text"
          name="categoryName"
          placeholder="Nova categoria..."
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="bg-neutral-800 border-neutral-700 h-9"
          disabled={isPending}
        />
        {/* AJUSTE: O botão agora é do tipo "button" e usa onClick */}
        <Button 
          type="button" 
          size="sm" 
          className="bg-amber-600 hover:bg-amber-700" 
          disabled={isPending || !newCategoryName.trim()}
          onClick={handleCreateCategory}
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} className="mr-1" /> Adicionar</>}
        </Button>
      </div>

      {/* A lista de checkboxes continua a mesma */}
      <div className="space-y-2 max-h-60 overflow-y-auto p-1 border border-neutral-700 rounded-md">
        {allCategories.length > 0 ? (
          allCategories.map(category => (
            <div key={category.id} className="flex items-center gap-2 p-2 rounded hover:bg-neutral-800">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                name="category_ids"
                value={category.id}
                defaultChecked={selectedCategoryIds.has(category.id)}
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 bg-neutral-900"
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm font-medium text-neutral-300 cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))
        ) : (
          <p className="text-sm text-neutral-500 text-center p-4">Nenhuma categoria encontrada.</p>
        )}
      </div>
    </div>
  );
}