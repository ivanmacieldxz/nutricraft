"use client";

import { useState } from "react";
import { MealPlan, MealPlanItem } from "@prisma/client/wasm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Utensils } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { removeRecipeFromPlan } from "@/app/actions/mealplan";
import { toast } from "sonner";
import { RecipeSearchModal } from "./RecipeSearchModal";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "snack", label: "Merienda" },
  { id: "dinner", label: "Cena" }
];

interface WeeklyGridProps {
  plan: (MealPlan & { items: MealPlanItem[] }) | null;
  weekStartDate: Date;
}

export function WeeklyGrid({ plan, weekStartDate }: WeeklyGridProps) {
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Estado para el modal de búsqueda
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number, mealType: string } | null>(null);

  const getItem = (day: number, mealType: string) => {
    return plan?.items.find(i => i.dayOfWeek === day && i.mealType === mealType);
  };

  const handleRemove = async (itemId: string) => {
    try {
      setIsRemoving(itemId);
      await removeRecipeFromPlan(itemId);
      toast.success("Receta removida del plan");
    } catch (error) {
      toast.error("Error al remover receta");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleOpenSearch = (day: number, mealType: string) => {
    setSelectedSlot({ day, mealType });
    setIsSearchOpen(true);
  };

  return (
    <div className="w-full pb-4">
      {/* Mobile Layout (< xl) */}
      <div className="flex flex-col gap-8 xl:hidden">
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex flex-col gap-3">
            <h3 className="font-bold text-xl text-foreground border-b border-border/50 pb-2">{day}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {MEAL_TYPES.map(meal => {
                const item = getItem(dayIdx, meal.id);
                return (
                  <div key={meal.id} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
                      <Utensils className="w-3 h-3 mr-1 opacity-50" />
                      {meal.label}
                    </span>
                    <div className="h-32">
                      {item ? (
                        <Card className="relative h-full w-full overflow-hidden group/card shadow-sm hover:shadow-md transition-all border-border/50 bg-card/50 backdrop-blur-sm p-0">
                          {item.imageUrl && (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover opacity-60 group-hover/card:opacity-80 transition-opacity"
                              sizes="(max-width: 768px) 50vw, 150px"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                          <div className="absolute inset-0 p-3 flex flex-col justify-end">
                            <Link href={`/recipes/${item.externalRecipeId}`} className="text-white font-semibold text-sm leading-tight hover:underline line-clamp-2 drop-shadow-md">
                              {item.title}
                            </Link>
                          </div>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={isRemoving === item.id}
                            className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground p-1.5 rounded-full opacity-100 md:opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-110 active:scale-95 disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Card>
                      ) : (
                        <button
                          onClick={() => handleOpenSearch(dayIdx, meal.id)}
                          className="w-full h-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group/btn"
                        >
                          <Plus className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-xs font-medium">Agregar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout (xl+) */}
      <div className="hidden xl:block w-full overflow-x-auto">
        <div className="min-w-[800px] grid grid-cols-8 gap-4">
          {/* Header de la tabla */}
          <div className="flex items-end pb-4 font-bold text-muted-foreground border-b border-border/50">
            <div className="text-sm uppercase tracking-wider">Comida</div>
          </div>
          {DAYS.map((day, idx) => (
            <div key={day} className="flex flex-col items-center justify-end pb-4 border-b border-border/50">
              <span className="font-bold">{day}</span>
            </div>
          ))}

          {/* Filas por comida */}
          {MEAL_TYPES.map(meal => (
            <div key={meal.id} className="col-span-8 grid grid-cols-8 gap-4 py-2 group">
              <div className="flex items-center text-sm font-semibold text-foreground/80 py-2">
                <Utensils className="w-4 h-4 mr-2 opacity-50" />
                {meal.label}
              </div>

              {DAYS.map((_, dayIdx) => {
                const item = getItem(dayIdx, meal.id);

                return (
                  <div key={dayIdx} className="h-32">
                    {item ? (
                      <Card className="relative h-full w-full overflow-hidden group/card shadow-sm hover:shadow-md transition-all border-border/50 bg-card/50 backdrop-blur-sm p-0">
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover opacity-60 group-hover/card:opacity-80 transition-opacity"
                            sizes="150px"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />

                        <div className="absolute inset-0 p-3 flex flex-col justify-end">
                          <Link href={`/recipes/${item.externalRecipeId}`} className="text-white font-semibold text-sm leading-tight hover:underline line-clamp-2 drop-shadow-md">
                            {item.title}
                          </Link>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={isRemoving === item.id}
                          className="absolute top-2 right-2 bg-destructive/90 text-destructive-foreground p-1.5 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-110 active:scale-95 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Card>
                    ) : (
                      <button
                        onClick={() => handleOpenSearch(dayIdx, meal.id)}
                        className="w-full h-full rounded-xl border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary group/btn"
                      >
                        <Plus className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-xs font-medium">Agregar</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <RecipeSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          dayOfWeek={selectedSlot.day}
          mealType={selectedSlot.mealType}
          weekStartDate={weekStartDate}
        />
      )}
    </div>
  );
}
