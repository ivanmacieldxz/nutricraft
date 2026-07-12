"use client";

import { useState } from "react";
import { getRecipeHistory } from "@/app/actions/saved";
import { RecipeCard } from "@/components/features/RecipeCard";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface HistoryItem {
  id: string;
  externalRecipeId: string;
  title: string;
  imageUrl: string | null;
  visitedAt: Date;
}

interface HistoryListProps {
  initialData: HistoryItem[];
  initialHasMore: boolean;
}

export function HistoryList({ initialData, initialHasMore }: HistoryListProps) {
  const [items, setItems] = useState<HistoryItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await getRecipeHistory(nextPage, 10);
      setItems((prev) => [...prev, ...res.items]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading history", error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-card/40 rounded-3xl border border-dashed gap-4 backdrop-blur-sm">
        <Clock className="w-12 h-12 text-muted-foreground/50" />
        <span className="text-muted-foreground font-medium text-lg">Tu historial está vacío.</span>
        <p className="text-muted-foreground/80 text-sm">Las recetas que visites aparecerán aquí automáticamente.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((recipe) => (
          <RecipeCard 
            key={`${recipe.externalRecipeId}-${recipe.visitedAt.toISOString()}`} 
            recipe={{
              idMeal: recipe.externalRecipeId,
              strMeal: recipe.title,
              strMealThumb: recipe.imageUrl || "",
            }} 
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={loadMore} 
            disabled={loading}
            className="rounded-full px-8 bg-card/50 backdrop-blur-md hover:bg-primary hover:text-primary-foreground"
          >
            {loading ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
      
      {!hasMore && items.length > 0 && (
        <div className="flex justify-center py-8">
          <span className="text-muted-foreground text-sm bg-muted/50 px-6 py-2 rounded-full border shadow-sm">
            Has llegado al final del historial
          </span>
        </div>
      )}
    </div>
  );
}
