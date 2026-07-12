/**
 * Edamam Nutrition Analysis API integration
 * Documentación: https://developer.edamam.com/edamam-docs-nutrition-api
 */

export interface NutritionData {
  calories: number;
  totalWeight: number;
  dietLabels: string[];
  healthLabels: string[];
  totalNutrients: {
    PROCNT?: { label: string, quantity: number, unit: string }; // Proteínas
    FAT?: { label: string, quantity: number, unit: string }; // Grasas
    CHOCDF?: { label: string, quantity: number, unit: string }; // Carbohidratos
  };
}

export async function getNutritionForRecipe(title: string, ingredients: string[]): Promise<NutritionData | null> {
  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;

  if (!appId || !appKey) {
    console.warn("Edamam credentials not configured. Returning null for nutrition data.");
    return null;
  }

  try {
    const response = await fetch(`https://api.edamam.com/api/nutrition-details?app_id=${appId}&app_key=${appKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        ingr: ingredients // The Edamam API expects an array of strings e.g. ["1 cup rice", "10 oz chickpeas"]
      })
    });

    if (!response.ok) {
      console.error("Edamam API error:", await response.text());
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nutrition data from Edamam:", error);
    return null;
  }
}
