const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export interface MealPreview {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
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
    return data.meals || [];
  },

  /**
   * Obtiene recetas aleatorias para poblar la pantalla de inicio
   */
  async getRandomMeals(count: number = 6): Promise<MealPreview[]> {
    // TheMealDB solo tiene endpoint para 1 random meal, o podemos buscar "a", "b", "c" al azar
    // Para simplificar, buscaremos una lista inicial vacía que devuelve recetas por defecto.
    const meals = await this.searchMeals("");
    return meals.slice(0, count);
  }
};
