'use client'

import { Label } from "@/components/ui/label";

type Category = {
  id: string;
  name: string;
};

interface CategoryCheckboxesProps {
  allCategories: Category[];
  selectedCategoryIds: Set<string>;
}

export default function CategoryCheckboxes({ allCategories, selectedCategoryIds }: CategoryCheckboxesProps) {
  return (
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
  );
}