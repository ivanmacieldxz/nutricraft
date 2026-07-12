/**
 * CalorieNinjas Nutrition API integration
 * Documentación: https://calorieninjas.com/api
 */

export interface NutritionData {
  calories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

export async function getNutritionForRecipe(ingredients: string[]): Promise<NutritionData | null> {
  const apiKey = process.env.CALORIENINJAS_API_KEY;

  if (!apiKey) {
    console.warn("CalorieNinjas API key not configured. Returning null for nutrition data.");
    return null;
  }

  try {
    const query = ingredients.join(" and ");
    const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "X-Api-Key": apiKey,
      }
    });

    if (!response.ok) {
      console.error("CalorieNinjas API error:", await response.text());
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return null;

    let calories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    for (const item of data.items) {
      calories += item.calories || 0;
      totalProtein += item.protein_g || 0;
      totalFat += item.fat_total_g || 0;
      totalCarbs += item.carbohydrates_total_g || 0;
    }

    return {
      calories,
      totalProtein,
      totalFat,
      totalCarbs
    };
  } catch (error) {
    console.error("Error fetching nutrition data from CalorieNinjas:", error);
    return null;
  }
}
