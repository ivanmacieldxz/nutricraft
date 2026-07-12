"use server";

import { MealDBService } from "@/services/mealdb";
import { translateArray, TranslatedItem } from "@/services/translation";
import { areaToCountryEs } from "@/lib/constants";

// Caché en memoria para evitar llamadas a la API de traducción en cada render
let categoriesCache: TranslatedItem[] | null = null;
let areasCache: TranslatedItem[] | null = null;
let ingredientsCache: TranslatedItem[] | null = null;

export async function getTranslatedCategories(): Promise<TranslatedItem[]> {
  if (categoriesCache) return categoriesCache;
  const list = await MealDBService.getCategoriesList();
  categoriesCache = await translateArray(list);
  return categoriesCache;
}

export async function getTranslatedAreas(): Promise<TranslatedItem[]> {
  if (areasCache) return areasCache;
  const list = await MealDBService.getAreasList();
  
  // Usamos el diccionario manual para forzar nombres de países en lugar de gentilicios
  areasCache = list.map(enArea => ({
    en: enArea,
    es: areaToCountryEs[enArea] || enArea
  })).sort((a, b) => a.es.localeCompare(b.es));
  
  return areasCache;
}

export async function getTranslatedIngredients(): Promise<TranslatedItem[]> {
  if (ingredientsCache) return ingredientsCache;
  const list = await MealDBService.getIngredientsList();
  ingredientsCache = await translateArray(list);
  return ingredientsCache;
}
