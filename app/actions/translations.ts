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

export type TranslatedRecipeDetail = {
  title: string;
  category: string;
  area: string;
  instructions: string;
  ingredients: string[]; // Combina medida + ingrediente traducido
};

import { MealDetail } from "@/services/mealdb";

export async function getTranslatedRecipe(meal: MealDetail): Promise<TranslatedRecipeDetail> {
  const areaEs = meal.strArea ? (areaToCountryEs[meal.strArea] || meal.strArea) : "";
  
  // Combina measure + name
  const fullIngredients = meal.ingredients.map(i => 
    i.measure ? `${i.measure} ${i.name}`.trim() : i.name
  );
  
  // Los textos a traducir
  const textsToTranslate = [
    meal.strMeal,
    meal.strCategory,
    meal.strInstructions,
    ...fullIngredients
  ];
  
  const translations = await translateArray(textsToTranslate, false);
  
  const titleEs = translations[0]?.es || meal.strMeal;
  const categoryEs = translations[1]?.es || meal.strCategory;
  const instructionsEs = translations[2]?.es || meal.strInstructions;
  const ingredientsEs = translations.slice(3).map(t => t.es);
  
  return {
    title: titleEs,
    category: categoryEs,
    area: areaEs,
    instructions: instructionsEs,
    ingredients: ingredientsEs
  };
}
