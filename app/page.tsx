"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Refrigerator, Search, X } from "lucide-react";
import { MealDBService, MealPreview } from "@/services/mealdb";
import { RecipeCard } from "@/components/features/RecipeCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useUser();
  const [recipes, setRecipes] = useState<MealPreview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Heladera Widget States
  const [ingredientInput, setIngredientInput] = useState("");
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>([]);

  useEffect(() => {
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
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* 1. Sticky Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 px-6 md:px-8 border-b bg-background/80 backdrop-blur-md shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <Refrigerator className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">NutriCraft</h1>
        </div>
        <div>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Link href="/sign-in">
              <Button className="rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-95">
                Entrar
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* 2. Sticky "Mi Heladera" Widget */}
      <div className="sticky top-[73px] z-40 bg-background/80 backdrop-blur-md border-b pb-4 pt-6 px-4 md:px-8 shadow-sm transition-all">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mi Heladera Virtual</h2>
            <p className="text-muted-foreground text-sm">¿Qué ingredientes tienes hoy? Añade uno para ver qué cocinar.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ej. Chicken, Tomato, Beef..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddIngredient()}
                className="pl-9 h-12 rounded-2xl bg-surface border-muted-foreground/20 focus-visible:ring-primary shadow-sm"
              />
            </div>
            <Button 
              onClick={handleAddIngredient} 
              className="h-12 px-8 rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Añadir
            </Button>
          </div>

          {/* Chips de Ingredientes Fijos */}
          {fridgeIngredients.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {fridgeIngredients.map(ing => (
                <Badge 
                  key={ing} 
                  variant="secondary" 
                  className="px-3 py-1.5 text-sm rounded-full gap-2 transition-all hover:bg-secondary/80 cursor-default"
                >
                  {ing}
                  <button 
                    onClick={() => handleRemoveIngredient(ing)}
                    className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Content (Recetas) */}
      <main className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-6 mt-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recetas Sugeridas</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="flex justify-center items-center py-20 bg-muted/30 rounded-3xl border border-dashed">
            <span className="text-muted-foreground font-medium">No se encontraron recetas con esos ingredientes.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {recipes.map(recipe => (
              <RecipeCard key={recipe.idMeal} recipe={recipe} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
