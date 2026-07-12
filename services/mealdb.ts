const MEALDB_BASE_URL = process.env.NEXT_PUBLIC_MEALDB_BASE_URL;

export interface MealPreview {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea?: string;
}

export interface MealDBResponse<T> {
  meals: T[] | null;
}

export const MealDBService = {
  /**
   * Busca recetas por nombre. Si no se pasa query, puede devolver lista default.
   */
  async searchMeals(query: string = ""): Promise<MealPreview[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/search.php?s=${query}`);
    if (!res.ok) throw new Error("Error fetching meals");
    const data: MealDBResponse<any> = await res.json();

    if (!data.meals) return [];

    // Mapeamos para devolver solo la preview necesaria en listados
    return data.meals.map(meal => ({
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strArea: meal.strArea,
    }));
  },

  /**
   * Filtra recetas por un ingrediente principal
   */
  async filterByIngredient(ingredient: string): Promise<MealPreview[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/filter.php?i=${ingredient}`);
    if (!res.ok) throw new Error("Error fetching meals by ingredient");
    const data: MealDBResponse<MealPreview> = await res.json();
    return data.meals || [];
  },
  
  /**
   * Filtra recetas por categoría (ej: Seafood, Beef)
   */
  async filterByCategory(category: string): Promise<MealPreview[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/filter.php?c=${category}`);
    if (!res.ok) throw new Error("Error fetching meals by category");
    const data: MealDBResponse<MealPreview> = await res.json();
    return data.meals || [];
  },

  /**
   * Filtra recetas por región/área (ej: Italian, Mexican)
   */
  async filterByArea(area: string): Promise<MealPreview[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/filter.php?a=${area}`);
    if (!res.ok) throw new Error("Error fetching meals by area");
    const data: MealDBResponse<MealPreview> = await res.json();
    // Agregamos manualmente el área ya que TheMealDB no la devuelve en filter.php
    return (data.meals || []).map(m => ({ ...m, strArea: area }));
  },

  /**
   * Obtiene recetas aleatorias reales consultando random.php en paralelo
   */
  async getTrulyRandomMeals(count: number = 12): Promise<MealPreview[]> {
    const promises = Array.from({ length: count }).map(() =>
      fetch(`${MEALDB_BASE_URL}/random.php`).then((r) => r.json())
    );
    const results = await Promise.all(promises);
    return results
      .map((res) => {
        const meal = res.meals?.[0];
        if (!meal) return null;
        return {
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strMealThumb: meal.strMealThumb,
          strArea: meal.strArea,
        };
      })
      .filter(Boolean) as MealPreview[];
  },

  /**
   * Obtiene la lista de todas las categorías disponibles
   */
  async getCategoriesList(): Promise<string[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/list.php?c=list`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.meals || []).map((m: any) => (m.strCategory || "").trim()).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  },

  /**
   * Obtiene la lista de todas las regiones/países disponibles
   */
  async getAreasList(): Promise<string[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/list.php?a=list`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.meals || []).map((m: any) => (m.strArea || "").trim()).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  },

  /**
   * Obtiene la lista de todos los ingredientes principales
   */
  async getIngredientsList(): Promise<string[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/list.php?i=list`);
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.meals || []).map((m: any) => (m.strIngredient || "").trim()).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  }
};
