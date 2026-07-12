import { notFound } from "next/navigation";
import { MealDBService } from "@/services/mealdb";
import { getTranslatedRecipe } from "@/app/actions/translations";
import { getNutritionForRecipe } from "@/services/edamam";
import { RecipeDetailView } from "@/components/features/RecipeDetailView";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) return notFound();

  const meal = await MealDBService.getMealById(id);
  if (!meal) return notFound();

  // Translate meal data
  const translatedData = await getTranslatedRecipe(meal);
  
  // Extraemos los ingredientes crudos originales (en inglés) para la API de Edamam
  const originalIngredients = meal.ingredients.map(i => 
    i.measure ? `${i.measure} ${i.name}`.trim() : i.name
  );
  const nutritionData = await getNutritionForRecipe(meal.strMeal, originalIngredients);

  return (
    <RecipeDetailView 
      meal={meal} 
      translatedData={translatedData} 
      nutritionData={nutritionData}
    />
  );
}
