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

  // Deduplicate recipes
  const uniqueRecipeIds = Array.from(new Set(plan.items.map(item => item.externalRecipeId)));
  const nutritionCache = new Map<string, NutritionData>();

  // 1. Fetch from DB cache first
  const cachedRecords = await prisma.recipeNutritionCache.findMany({
    where: { externalRecipeId: { in: uniqueRecipeIds } }
  });

  for (const record of cachedRecords) {
    nutritionCache.set(record.externalRecipeId, {
      calories: record.calories,
      totalProtein: record.totalProtein,
      totalFat: record.totalFat,
      totalCarbs: record.totalCarbs,
    });
  }

  // 2. Identify missing records
  const missingRecipeIds = uniqueRecipeIds.filter(id => !nutritionCache.has(id));

  // 3. Fetch and cache missing records (Fallback)
  if (missingRecipeIds.length > 0) {
    await Promise.all(
      missingRecipeIds.map(async (recipeId) => {
        try {
          const meal = await MealDBService.getMealById(recipeId);
          if (meal) {
            const originalIngredients = meal.ingredients.map(i =>
              i.measure ? `${i.measure} ${i.name}`.trim() : i.name
            );
            const nutrition = await getNutritionForRecipe(originalIngredients);
            if (nutrition) {
              nutritionCache.set(recipeId, nutrition);
              
              // Save to DB so next time it's instant
              await prisma.recipeNutritionCache.create({
                data: {
                  externalRecipeId: recipeId,
                  calories: nutrition.calories,
                  totalProtein: nutrition.totalProtein,
                  totalCarbs: nutrition.totalCarbs,
                  totalFat: nutrition.totalFat,
                }
              });
            }
          }
        } catch (error) {
          console.error(`Failed to fetch and cache nutrition fallback for recipe ${recipeId}`, error);
        }
      })
    );
  }

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

