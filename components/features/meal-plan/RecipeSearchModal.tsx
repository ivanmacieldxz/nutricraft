"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { MealDBService, MealPreview } from "@/services/mealdb";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";
import { addRecipeToPlan } from "@/app/actions/mealplan";
import { toast } from "sonner";

interface RecipeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayOfWeek: number;
  mealType: string;
  weekStartDate: Date;
}

export function RecipeSearchModal({
  isOpen,
  onClose,
  dayOfWeek,
  mealType,
  weekStartDate,
}: RecipeSearchModalProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState<MealPreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    async function search() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const data = await MealDBService.searchMeals(debouncedQuery);
        setResults(data || []);
      } catch (error) {
        toast.error("Error al buscar recetas");
      } finally {
        setIsLoading(false);
      }
    }
    search();
  }, [debouncedQuery]);

  const handleSelect = async (recipe: MealPreview) => {
    setIsSaving(true);
    startTransition(async () => {
      try {
        await addRecipeToPlan({
          externalRecipeId: recipe.idMeal,
          title: recipe.strMeal,
          imageUrl: recipe.strMealThumb,
          dayOfWeek,
          mealType,
          weekStartDate,
        });
        toast.success("Receta guardada en el plan");
        onClose();
      } catch (error) {
        toast.error("Error al guardar receta");
      } finally {
        setIsSaving(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="p-6 pb-4 bg-card border-b">
          <DialogTitle>Agregar Receta</DialogTitle>
          <DialogDescription>
            Busca una receta para asignarla a este horario.
          </DialogDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Ej: Chicken, Salad, Pasta..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 bg-background"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron recetas para "{query}"
            </div>
          ) : (
            results.map((recipe) => (
              <button
                key={recipe.idMeal}
                onClick={() => handleSelect(recipe)}
                disabled={isSaving}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border text-left disabled:opacity-50"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={recipe.strMealThumb}
                    alt={recipe.strMeal}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {recipe.strMeal}
                  </h4>
                  {recipe.strArea && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {recipe.strArea}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
          
          {!query && (
            <div className="text-center py-12 text-muted-foreground/60">
              Escribe un ingrediente o nombre para empezar a buscar.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
