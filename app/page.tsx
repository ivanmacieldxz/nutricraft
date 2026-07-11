"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { MealDBService, MealPreview } from "@/services/mealdb";
import { RecipeCard } from "@/components/features/RecipeCard";

export default function Home() {
  const { isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<MealPreview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Heladera Widget States
  const [ingredientInput, setIngredientInput] = useState("");
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>([]);

  useEffect(() => {
    // Carga inicial
    loadDefaultRecipes();
  }, []);

  const loadDefaultRecipes = async () => {
    setLoading(true);
    try {
      const data = await MealDBService.getRandomMeals(8);
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const searchByFridge = async (ingredients: string[]) => {
    if (ingredients.length === 0) {
      return loadDefaultRecipes();
    }
    setLoading(true);
    try {
      // TheMealDB free tier soporta filtrado por un ingrediente principal
      // Para esta versión usamos el primer ingrediente
      const data = await MealDBService.filterByIngredient(ingredients[0]);
      setRecipes(data || []);
    } catch (error) {
      console.error(error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    const ing = ingredientInput.trim().toLowerCase();
    if (ing && !fridgeIngredients.includes(ing)) {
      const newIngredients = [...fridgeIngredients, ing];
      setFridgeIngredients(newIngredients);
      setIngredientInput("");
      searchByFridge(newIngredients);
    }
  };

  const handleRemoveIngredient = (ing: string) => {
    const newIngredients = fridgeIngredients.filter(i => i !== ing);
    setFridgeIngredients(newIngredients);
    searchByFridge(newIngredients);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-surface shadow-sm">
        <h1 className="text-2xl font-bold text-primary">NutriCraft</h1>
        <div>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <md-filled-button href="/sign-in">Entrar</md-filled-button>
          )}
        </div>
      </header>

      <main className="flex-grow p-4 max-w-5xl mx-auto w-full flex flex-col gap-8">
        
        {/* Widget Mi Heladera */}
        <section className="bg-primary-container p-6 rounded-3xl flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-on-primary-container flex items-center gap-2">
            <md-icon>kitchen</md-icon>
            Mi Heladera
          </h2>
          <p className="text-on-primary-container/80">¿Qué ingredientes tienes hoy? Añade uno principal para ver qué cocinar.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <md-outlined-text-field
              label="Ej. Chicken, Tomato..."
              value={ingredientInput}
              onInput={(e: any) => setIngredientInput(e.target.value)}
              onKeyDown={(e: any) => e.key === "Enter" && handleAddIngredient()}
              className="flex-grow"
            />
            <md-filled-button onClick={handleAddIngredient}>
              Añadir
            </md-filled-button>
          </div>

          {fridgeIngredients.length > 0 && (
            <md-chip-set>
              {fridgeIngredients.map(ing => (
                <md-filter-chip
                  key={ing}
                  label={ing}
                  selected
                  onClick={() => handleRemoveIngredient(ing)}
                />
              ))}
            </md-chip-set>
          )}
        </section>

        {/* Listado de Recetas */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Explorar Recetas</h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <span className="text-muted-foreground">Cargando recetas...</span>
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex justify-center p-8 bg-surface-variant rounded-2xl">
              <span className="text-on-surface-variant">No se encontraron recetas con esos ingredientes.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map(recipe => (
                <RecipeCard key={recipe.idMeal} recipe={recipe} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
