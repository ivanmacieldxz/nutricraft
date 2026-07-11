"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { MealDBService, MealPreview } from "@/services/mealdb";
import { RecipeCard } from "@/components/features/RecipeCard";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "name";

  const [allRecipes, setAllRecipes] = useState<MealPreview[]>([]);
  const [displayedRecipes, setDisplayedRecipes] = useState<MealPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Fetch initial results when search params change
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setPage(1);
      try {
        let data: MealPreview[] = [];
        if (!query) {
          // If no query, we show some default/random recipes
          data = await MealDBService.getRandomMeals(50); // Get a large batch of defaults
        } else {
          switch (type) {
            case "category":
              data = await MealDBService.filterByCategory(query);
              break;
            case "ingredient":
              data = await MealDBService.filterByIngredient(query);
              break;
            case "region":
              data = await MealDBService.filterByArea(query);
              break;
            case "name":
            default:
              data = await MealDBService.searchMeals(query);
              break;
          }
        }
        
        const validData = data || [];
        setAllRecipes(validData);
        setDisplayedRecipes(validData.slice(0, ITEMS_PER_PAGE));
        setHasMore(validData.length > ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setAllRecipes([]);
        setDisplayedRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query, type]);

  // Handle infinite scrolling
  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newItems = allRecipes.slice(startIndex, endIndex);
      
      if (newItems.length > 0) {
        setDisplayedRecipes((prev) => [...prev, ...newItems]);
        setPage(nextPage);
        setHasMore(endIndex < allRecipes.length);
      }
    }
  }, [inView, hasMore, loading, page, allRecipes]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {query ? `Resultados para "${query}"` : "Descubre Recetas"}
        </h2>
        {query && (
          <p className="text-muted-foreground">
            Encontramos {allRecipes.length} recetas en tu búsqueda.
          </p>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : displayedRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-muted/30 rounded-3xl border border-dashed gap-4">
          <span className="text-muted-foreground font-medium text-lg">No se encontraron recetas.</span>
          <p className="text-muted-foreground/80 text-sm">Prueba buscando con otro término o cambiando el filtro (Categoría, Ingrediente, etc).</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedRecipes.map((recipe, index) => (
              <RecipeCard key={`${recipe.idMeal}-${index}`} recipe={recipe} />
            ))}
          </div>
          
          {/* Intersection Observer Trigger Element */}
          {hasMore && (
            <div ref={ref} className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          {!hasMore && displayedRecipes.length > 0 && (
            <div className="flex justify-center py-12">
              <span className="text-muted-foreground font-medium bg-muted/50 px-6 py-2 rounded-full border shadow-sm">
                Has llegado al final de los resultados 🍽️
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
