import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ShoppingBag, Utensils } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "snack", label: "Merienda" },
  { id: "dinner", label: "Cena" }
];

export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col xl:gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Planificador</h2>
          <p className="text-muted-foreground mt-1">
            Organizá tus comidas y generá tu lista de compras automáticamente.
          </p>
        </div>

        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      <div className="w-full mt-4">
        <div className="grid w-full max-w-md grid-cols-2 mx-auto mb-8 bg-card/50 backdrop-blur-xl border shadow-sm p-1 rounded-lg">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>

        <div className="xl:mt-8">
          <div className="m-0">
            <div className="w-full pb-4">
          {/* Mobile Layout (< xl) */}
          <div className="flex flex-col gap-8 xl:hidden">
            {DAYS.map((day) => (
              <div key={day} className="flex flex-col gap-3">
                <h3 className="font-bold text-xl text-foreground border-b border-border/50 pb-2">{day}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {MEAL_TYPES.map(meal => (
                    <div key={meal.id} className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
                        <Utensils className="w-3 h-3 mr-1 opacity-50" />
                        {meal.label}
                      </span>
                      <div className="h-32 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden p-0">
                        <Skeleton className="w-full h-full" />
                      </div>
                    </div>
                  ))}
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
              {DAYS.map((day) => (
                <div key={day} className="flex flex-col items-center justify-end pb-4 border-b border-border/50">
                  <span className="font-bold text-sm text-foreground/80">{day}</span>
                </div>
              ))}

              {/* Filas por comida */}
              {MEAL_TYPES.map(meal => (
                <div key={meal.id} className="col-span-8 grid grid-cols-8 gap-4 py-2 group">
                  <div className="flex items-center text-sm font-semibold text-foreground/80 py-2">
                    <Utensils className="w-4 h-4 mr-2 opacity-50" />
                    {meal.label}
                  </div>
                  {DAYS.map((_, dayIdx) => (
                    <div key={dayIdx} className="h-32 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden p-0">
                      <Skeleton className="w-full h-full" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
