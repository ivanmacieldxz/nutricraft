"use client";

import { useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { MealDetail } from "@/services/mealdb";
import { TranslatedRecipeDetail } from "@/app/actions/translations";
import { NutritionData } from "@/services/nutrition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Bookmark, CalendarPlus, CheckCircle2, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanRecipeModal } from "./meal-plan/PlanRecipeModal";
import { toggleSavedRecipe } from "@/app/actions/saved";

interface RecipeDetailViewProps {
  meal: MealDetail;
  translatedData: TranslatedRecipeDetail;
  nutritionData: NutritionData | null;
  userAllergies?: string[];
  initialIsSaved?: boolean;
}

export function RecipeDetailView({ meal, translatedData, nutritionData, userAllergies = [], initialIsSaved = false }: RecipeDetailViewProps) {
  const { isSignedIn } = useUser();
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [hasWarnedSave, setHasWarnedSave] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);

  // Compute if any translated ingredient contains an allergy
  const hasAllergies = translatedData.ingredients.some((ing) =>
    userAllergies.some((allergy) => ing.toLowerCase().includes(allergy.toLowerCase()))
  );

  const handleProtectedAction = async (action: string) => {
    if (!isSignedIn) {
      toast.error(`Debes iniciar sesión para ${action} recetas.`);
      return;
    }
    
    if (action === "guardar") {
      if (hasAllergies && !hasWarnedSave && !isSaved) {
        toast.warning("¡Atención! Esta receta contiene alergias para ti.", {
           description: "Contiene ingredientes que has marcado como rechazados en tu perfil.",
           action: {
             label: "Guardar igual",
             onClick: () => {
               setHasWarnedSave(true);
               executeToggleSave();
             }
           },
           duration: 8000,
        });
        return;
      }
      await executeToggleSave();
    }
  };

  const executeToggleSave = async () => {
    setIsSaving(true);
    try {
      const res = await toggleSavedRecipe(meal.idMeal, translatedData.title, meal.strMealThumb);
      setIsSaved(res.saved);
      if (res.saved) {
        toast.success("Receta guardada en tus favoritas");
      } else {
        toast.info("Receta eliminada de favoritas");
      }
    } catch (error) {
      toast.error("Ocurrió un error al guardar la receta");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Splitting instructions by newline or dot for better readability
  const steps = translatedData.instructions
    .split(/\n|\.(?=\s[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 5); // Ignore empty or very short strings

  return (
    <div className="animate-in fade-in duration-700 w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">

      {/* Hero Section */}
      <div className="relative w-full h-[40vh] md:h-[50vh] rounded-[2rem] overflow-hidden shadow-2xl transform-gpu">
        <Image
          src={meal.strMealThumb}
          alt={translatedData.title}
          fill
          className="object-cover transition-transform duration-1000 hover:scale-105"
          priority
        />
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6 flex-wrap lg:flex-nowrap">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary text-primary-foreground backdrop-blur-md border-transparent hover:bg-primary/30">
                <ChefHat className="w-3 h-3 mr-1" />
                {translatedData.category}
              </Badge>
              {translatedData.area && (
                <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md">
                  {translatedData.area}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-xl">
              {translatedData.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={isSaved ? "default" : "secondary"}
              size="lg"
              disabled={isSaving}
              onClick={() => handleProtectedAction("guardar")}
              className={cn(
                "rounded-full shadow-lg hover:scale-105 transition-transform backdrop-blur-md border",
                isSaved 
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              )}
            >
              <Bookmark className={cn("w-5 h-5 mr-2", isSaved && "fill-current")} />
              {isSaved ? "Guardada" : "Guardar"}
            </Button>
            <PlanRecipeModal 
              recipe={{ idMeal: meal.idMeal, strMeal: translatedData.title, strMealThumb: meal.strMealThumb }} 
              hasAllergyWarning={hasAllergies}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Ingredients and Instructions */}
        <div className="lg:col-span-2 space-y-10">

          {/* Ingredients Section */}
          <section className="bg-card/40 backdrop-blur-xl transform-gpu border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Ingredientes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {translatedData.ingredients.map((ingredient, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleIngredient(idx)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer border",
                    checkedIngredients[idx]
                      ? "bg-primary/10 border-primary/30 opacity-70"
                      : "bg-background/50 border-transparent hover:bg-secondary hover:border-border/50"
                  )}
                >
                  <Checkbox
                    checked={!!checkedIngredients[idx]}
                    onCheckedChange={() => toggleIngredient(idx)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
                  />
                  <span className={cn(
                    "text-sm font-medium leading-none transition-all",
                    checkedIngredients[idx] && "line-through text-muted-foreground"
                  )}>
                    {ingredient}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Instructions Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 px-2">
              <PlayCircle className="w-6 h-6 text-primary" />
              Preparación
            </h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-5 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/40 transition-colors hover:bg-card/60">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                    {idx + 1}
                  </div>
                  <p className="text-foreground/90 leading-relaxed pt-1.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Nutrition & Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8 h-fit pb-8">
          <Card className="rounded-3xl border-border/50 shadow-sm bg-card/40 backdrop-blur-xl overflow-hidden transform-gpu">
            <CardHeader className="p-5 bg-primary/5 border-b border-border/50">
              <CardTitle className="text-xl">Información Nutricional</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-6 space-y-6">
              {!nutritionData ? (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Configura CalorieNinjas API para ver valores reales</p>
                  <Badge variant="outline" className="animate-pulse">Pendiente de Integración</Badge>
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Valores estimados totales</p>
                </div>
              )}

              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-background/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Calorías</p>
                  <p className="text-2xl font-bold">{nutritionData ? Math.round(nutritionData.calories) : "--"}</p>
                </div>
                <div className="space-y-1 bg-background/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Proteínas</p>
                  <p className="text-2xl font-bold">
                    {nutritionData ? `${Math.round(nutritionData.totalProtein)}g` : "--"}
                  </p>
                </div>
                <div className="space-y-1 bg-background/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Carbs</p>
                  <p className="text-2xl font-bold">
                    {nutritionData ? `${Math.round(nutritionData.totalCarbs)}g` : "--"}
                  </p>
                </div>
                <div className="space-y-1 bg-background/50 p-3 rounded-xl text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Grasas</p>
                  <p className="text-2xl font-bold">
                    {nutritionData ? `${Math.round(nutritionData.totalFat)}g` : "--"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {meal.strYoutube && (
            <Card className="rounded-3xl border-border/50 shadow-sm bg-card/40 backdrop-blur-xl overflow-hidden transform-gpu">
              <CardHeader className="p-5 border-b border-border/50">
                <CardTitle className="text-lg">Video Tutorial</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <a href={meal.strYoutube} target="_blank" rel="noreferrer" className="block relative group aspect-video bg-black">
                  <Image
                    src={meal.strMealThumb}
                    alt="Thumbnail"
                    fill
                    className="object-cover opacity-60 transition-opacity group-hover:opacity-40"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all" />
                  </div>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
