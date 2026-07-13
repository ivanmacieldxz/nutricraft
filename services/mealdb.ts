const MEALDB_BASE_URL = process.env.NEXT_PUBLIC_MEALDB_BASE_URL;

export interface MealPreview {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strArea?: string;
  strCategory?: string;
  dietBadge?: {
    text: string;
    type: "destructive" | "info";
  };
}

export interface MealDBResponse<T> {
  meals: T[] | null;
}

export interface RecipeIngredient {
  name: string;
  measure: string;
}

export interface MealDetail extends MealPreview {
  strCategory: string;
  strInstructions: string;
  ingredients: RecipeIngredient[];
  strYoutube?: string;
  strTags?: string;
}

export const MealDBService = {
  /**
   * Obtiene los detalles completos de una receta por su ID
   */
  async getMealById(id: string): Promise<MealDetail | null> {
    const res = await fetch(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
    if (!res.ok) throw new Error("Error fetching meal details");
    const data = await res.json();
    
    if (!data.meals || !data.meals[0]) return null;
    
    const meal = data.meals[0];
    
    // Extraer y limpiar ingredientes y medidas
    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      // TheMealDB a veces retorna strings vacíos, espacios en blanco o null
      if (name && name.trim() !== "") {
        ingredients.push({
          name: name.trim(),
          measure: measure ? measure.trim() : ""
        });
      }
    }
    
    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strArea: meal.strArea,
      strCategory: meal.strCategory,
      strInstructions: meal.strInstructions,
      strYoutube: meal.strYoutube,
      strTags: meal.strTags,
      ingredients
    };
  },

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
    // Algunas áreas en TheMealDB list.php difieren de filter.php (ej. Argentine vs Argentina)
    const apiAreaMap: Record<string, string> = {
      "Argentine": "Argentina",
      "Motswana": "Botswana",
    };
    const queryArea = apiAreaMap[area] || area;

    const res = await fetch(`${MEALDB_BASE_URL}/filter.php?a=${queryArea}`);
    if (!res.ok) throw new Error("Error fetching meals by area");
    const data: MealDBResponse<MealPreview> = await res.json();
    
    // Agregamos manualmente el área ya que TheMealDB no la devuelve en filter.php
    return (data.meals || []).map(m => ({ ...m, strArea: area }));
  },

  async getTrulyRandomMeals(count: number = 12): Promise<MealPreview[]> {
    const letters = 'abcdefghijklmnoprstvwxy'; // exclude q, u, z to avoid empty results typically
    let results: MealPreview[] = [];
    
    // Try up to 3 times to get enough meals
    for (let i = 0; i < 3; i++) {
      if (results.length >= count) break;
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      try {
        const res = await fetch(`${MEALDB_BASE_URL}/search.php?f=${randomLetter}`);
        if (res.ok) {
          const data = await res.json();
          if (data.meals) {
            const newMeals = data.meals.map((meal: any) => ({
              idMeal: meal.idMeal,
              strMeal: meal.strMeal,
              strMealThumb: meal.strMealThumb,
              strArea: meal.strArea,
              strCategory: meal.strCategory,
            }));
            
            // Add unique meals
            const existingIds = new Set(results.map(r => r.idMeal));
            const uniqueNewMeals = newMeals.filter((m: MealPreview) => !existingIds.has(m.idMeal));
            results = [...results, ...uniqueNewMeals];
          }
        }
      } catch (e) {
        console.error("Error fetching random meals:", e);
      }
    }
    
    // Shuffle the results
    results.sort(() => 0.5 - Math.random());
    
    return results.slice(0, count);
  },

  /**
   * Obtiene la lista de todas las categorías disponibles
   */
  async getCategoriesList(): Promise<string[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/list.php?c=list`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.meals || []).map((m: any) => (m.strCategory || "").trim()).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  },

  /**
   * Obtiene la lista de todas las regiones/países disponibles
   */
  async getAreasList(): Promise<string[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/list.php?a=list`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.meals || []).map((m: any) => (m.strArea || "").trim()).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  },

  /**
   * Obtiene la lista de todos los ingredientes principales
   */
  async getIngredientsList(): Promise<string[]> {
    const res = await fetch(`${MEALDB_BASE_URL}/list.php?i=list`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = (data.meals || []).map((m: any) => (m.strIngredient || "").trim()).filter(Boolean);
    return Array.from(new Set(list)) as string[];
  }
};
