import { notFound } from "next/navigation";
import { MealDBService } from "@/services/mealdb";
import { getTranslatedRecipe } from "@/app/actions/translations";
import { getNutritionForRecipe } from "@/services/nutrition";
import { RecipeDetailView } from "@/components/features/RecipeDetailView";
import { addRecipeToHistory, isRecipeSaved } from "@/app/actions/saved";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) return notFound();

  const meal = await MealDBService.getMealById(id);
  if (!meal) return notFound();

  // Translate meal data
  const translatedData = await getTranslatedRecipe(meal);

  // Extraemos los ingredientes crudos originales (en inglés) para la API de CalorieNinjas
  const originalIngredients = meal.ingredients.map(i =>
    i.measure ? `${i.measure} ${i.name}`.trim() : i.name
  );
  const nutritionData = await getNutritionForRecipe(originalIngredients);

  const { getUserPreferences } = await import("@/app/actions/preferences");
  const preferences = await getUserPreferences().catch(() => null);
  const userAllergies = preferences?.allergies || [];

  // Registrar visita y obtener estado de guardado en paralelo
  const [_, isSaved] = await Promise.all([
    addRecipeToHistory(meal.idMeal, translatedData.title, meal.strMealThumb),
    isRecipeSaved(meal.idMeal)
  ]);

  return (
    <RecipeDetailView
      meal={meal}
      translatedData={translatedData}
      nutritionData={nutritionData}
      userAllergies={userAllergies}
      initialIsSaved={isSaved}
    />
  );
}
