"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addRecipeToPlan } from "@/app/actions/mealplan";
import { toast } from "sonner";
import { Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MEAL_TYPES = [
  { id: "breakfast", label: "Desayuno" },
  { id: "lunch", label: "Almuerzo" },
  { id: "snack", label: "Merienda" },
  { id: "dinner", label: "Cena" }
];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

interface PlanRecipeModalProps {
  recipe: {
    idMeal: string;
    strMeal: string;
    strMealThumb: string | null;
  };
  hasAllergyWarning?: boolean;
}

export function PlanRecipeModal({ recipe, hasAllergyWarning }: PlanRecipeModalProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasWarnedPlan, setHasWarnedPlan] = useState(false);

  const handleOpenClick = (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      toast.error("Debes iniciar sesión para planificar recetas");
      router.push("/sign-in");
    }
  };

  const executeSave = () => {
    startTransition(async () => {
      try {
        const weekStartDate = getMonday(new Date()); // Por defecto esta semana
        await addRecipeToPlan({
          externalRecipeId: recipe.idMeal,
          title: recipe.strMeal,
          imageUrl: recipe.strMealThumb,
          dayOfWeek: selectedDay!,
          mealType: selectedMeal!,
          weekStartDate,
        });
        toast.success("Agregado al plan semanal");
        setIsOpen(false);
      } catch (error) {
        toast.error("Ocurrió un error al guardar");
      }
    });
  };

  const handleSave = () => {
    if (selectedDay === null || !selectedMeal) {
      toast.error("Seleccioná un día y una comida");
      return;
    }
    
    if (hasAllergyWarning && !hasWarnedPlan) {
      toast.warning("¡Atención! Esta receta contiene alergias para ti.", {
         description: "Contiene ingredientes que has marcado como rechazados en tu perfil.",
         action: {
           label: "Añadir igual",
           onClick: () => {
             setHasWarnedPlan(true);
             executeSave();
           }
         },
         duration: 8000,
      });
      return;
    }
    
    executeSave();
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-full flex-1 border-primary/20 hover:bg-primary/5 transition-all shadow-sm"
          onClick={handleOpenClick}
        />
      }>
        <Calendar className="w-5 h-5 mr-2 text-primary" />
        Planificar
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Planificar Receta</DialogTitle>
          <DialogDescription>
            Elegí en qué momento querés comer {recipe.strMeal}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/80">Día de la semana</h4>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(idx)}
                  className={cn(
                    "px-2 py-2 text-xs font-medium rounded-xl border transition-all shadow-sm",
                    selectedDay === idx 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background hover:bg-secondary border-border/50"
                  )}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/80">Comida</h4>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal.id)}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium rounded-xl border transition-all shadow-sm",
                    selectedMeal === meal.id 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background hover:bg-secondary border-border/50"
                  )}
                >
                  {meal.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <Button variant="ghost" className="rounded-full" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            className="rounded-full px-6" 
            onClick={handleSave}
            disabled={isPending || selectedDay === null || !selectedMeal}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
