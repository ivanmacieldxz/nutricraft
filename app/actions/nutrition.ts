"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MealDBService } from "@/services/mealdb";
import { getNutritionForRecipe, NutritionData } from "@/services/nutrition";

export interface DailyNutrition {
  dayOfWeek: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface WeeklyNutritionSummary {
  daily: DailyNutrition[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export async function getWeeklyNutritionStats(weekStartDate: Date): Promise<WeeklyNutritionSummary> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const plan = await prisma.mealPlan.findFirst({
    where: {
      userId,
      weekStartDate,
    },
    include: {
      items: true,
    },
  });

  const daily: DailyNutrition[] = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  }));

  if (!plan || plan.items.length === 0) {
    return {
      daily,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
    };
  }

  // Deduplicate recipes to minimize API calls
  const uniqueRecipeIds = Array.from(new Set(plan.items.map(item => item.externalRecipeId)));
  const nutritionCache = new Map<string, NutritionData>();

  // Fetch recipe details and nutrition in parallel batches
  await Promise.all(
    uniqueRecipeIds.map(async (recipeId) => {
      try {
        const meal = await MealDBService.getMealById(recipeId);
        if (meal) {
          const originalIngredients = meal.ingredients.map(i =>
            i.measure ? `${i.measure} ${i.name}`.trim() : i.name
          );
          const nutrition = await getNutritionForRecipe(originalIngredients);
          if (nutrition) {
            nutritionCache.set(recipeId, nutrition);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch nutrition for recipe ${recipeId}`, error);
      }
    })
  );

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Aggregate nutrition per day
  for (const item of plan.items) {
    const nutrition = nutritionCache.get(item.externalRecipeId);
    if (nutrition) {
      daily[item.dayOfWeek].calories += Math.round(nutrition.calories);
      daily[item.dayOfWeek].protein += Math.round(nutrition.totalProtein);
      daily[item.dayOfWeek].carbs += Math.round(nutrition.totalCarbs);
      daily[item.dayOfWeek].fat += Math.round(nutrition.totalFat);

      totalCalories += Math.round(nutrition.calories);
      totalProtein += Math.round(nutrition.totalProtein);
      totalCarbs += Math.round(nutrition.totalCarbs);
      totalFat += Math.round(nutrition.totalFat);
    }
  }

  return {
    daily,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
  };
}

export async function getUserPreferences() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const preferences = await prisma.preferences.findUnique({
    where: { userId },
  });

  return preferences;
}
