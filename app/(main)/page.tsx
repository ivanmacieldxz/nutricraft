"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MealDBService, MealPreview } from "@/services/mealdb";
import { RecipeCard } from "@/components/features/RecipeCard";
import { translateToEnglish } from "@/app/actions/translations";
import { getUserPreferences } from "@/app/actions/preferences";
import { Suspense } from "react";

const ITEMS_PER_PAGE = 12;



function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const filterValue = searchParams.get("filterValue") || "";

  const [allRecipes, setAllRecipes] = useState<MealPreview[]>([]);
  const [displayedRecipes, setDisplayedRecipes] = useState<MealPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Usamos una ref para asegurarnos de que loadMore solo actúe sobre los datos de la búsqueda actual
  const currentQuerySig = React.useRef("");
  const sig = `${query}|${type}|${filterValue}`;

  // Fetch initial results when search params change
  useEffect(() => {
    let isSubscribed = true;

    const fetchRecipes = async () => {
      setLoading(true);
      setPage(1);
      
      try {
        let data: MealPreview[] = [];
        let hasMoreData = false;

        if (!query && !type) {
          const prefs = await getUserPreferences();
          if (prefs && prefs.diets && prefs.diets.length > 0) {
            // Modo Dieta Preferida
            data = await MealDBService.filterByCategory(prefs.diets[0]);
            if (!isSubscribed) return;
            setAllRecipes(data);
            const displayed = data.slice(0, ITEMS_PER_PAGE);
            setDisplayedRecipes(displayed);
            hasMoreData = data.length > ITEMS_PER_PAGE;
            setHasMore(hasMoreData);
          } else {
            // Modo Descubrimiento Puro
            data = await MealDBService.getTrulyRandomMeals(ITEMS_PER_PAGE);
            if (!isSubscribed) return;
            setAllRecipes([]); 
            setDisplayedRecipes(data);
            setHasMore(true);
            hasMoreData = true;
          }
        } else {
          // Modo Búsqueda y/o Filtro
          if (type && filterValue) {
            switch (type) {
              case "category":
                data = await MealDBService.filterByCategory(filterValue);
                break;
              case "ingredient":
                data = await MealDBService.filterByIngredient(filterValue);
                break;
              case "region":
                data = await MealDBService.filterByArea(filterValue);
                break;
            }
            if (query) {
              const lowerQ = query.toLowerCase();
              data = (data || []).filter(r => r.strMeal.toLowerCase().includes(lowerQ));
            }
          } else if (query) {
            const englishQuery = await translateToEnglish(query);
            const data1 = await MealDBService.searchMeals(englishQuery) || [];
            
            let data2: MealPreview[] = [];
            if (englishQuery.toLowerCase() !== query.toLowerCase()) {
              data2 = await MealDBService.searchMeals(query) || [];
            }
            
            const merged = [...data1, ...data2];
            const uniqueMap = new Map();
            merged.forEach(m => uniqueMap.set(m.idMeal, m));
            data = Array.from(uniqueMap.values());
          }
          
          if (!isSubscribed) return;
          const validData = data || [];
          
          // Ordenar alfabéticamente
          validData.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
          
          setAllRecipes(validData);
          const displayed = validData.slice(0, ITEMS_PER_PAGE);
          setDisplayedRecipes(displayed);
          hasMoreData = validData.length > ITEMS_PER_PAGE;
          setHasMore(hasMoreData);
        }

        currentQuerySig.current = sig;

      } catch (error) {
        if (!isSubscribed) return;
        console.error("Error fetching recipes:", error);
        setAllRecipes([]);
        setDisplayedRecipes([]);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchRecipes();

    return () => {
      isSubscribed = false;
    };
  }, [query, type, filterValue, sig]);

  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }, {
        rootMargin: "800px" 
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Escuchar cambios de página para cargar más
  useEffect(() => {
    let isSubscribed = true;
    
    // Prevenir carga si los datos actuales no corresponden a los parámetros de la URL
    if (page > 1 && currentQuerySig.current === sig) {
      const loadMore = async () => {
        setLoadingMore(true);
        try {
          if (!query && !type) {
            const prefs = await getUserPreferences();
            if (prefs && prefs.diets && prefs.diets.length > 0) {
              const startIndex = (page - 1) * ITEMS_PER_PAGE;
              const endIndex = startIndex + ITEMS_PER_PAGE;
              const newItems = allRecipes.slice(startIndex, endIndex);
              
              if (!isSubscribed) return;
              if (newItems.length > 0) {
                setDisplayedRecipes((prev) => {
                  const existingIds = new Set(prev.map((r) => r.idMeal));
                  const uniqueItems = newItems.filter((i) => !existingIds.has(i.idMeal));
                  return [...prev, ...uniqueItems];
                });
                const stillHasMore = endIndex < allRecipes.length;
                setHasMore(stillHasMore);
              } else {
                setHasMore(false);
              }
            } else {
              const newItems = await MealDBService.getTrulyRandomMeals(ITEMS_PER_PAGE);
              if (!isSubscribed) return;
              if (newItems.length > 0) {
                setDisplayedRecipes((prev) => {
                  const existingIds = new Set(prev.map((r) => r.idMeal));
                  const uniqueItems = newItems.filter((i) => !existingIds.has(i.idMeal));
                  if (uniqueItems.length > 0) {
                    setHasMore(true);
                    return [...prev, ...uniqueItems];
                  } else {
                    setHasMore(false);
                    return prev;
                  }
                });
              } else {
                setHasMore(false);
              }
            }
          } else {
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const newItems = allRecipes.slice(startIndex, endIndex);
            
            if (!isSubscribed) return;
            if (newItems.length > 0) {
              setDisplayedRecipes((prev) => {
                const existingIds = new Set(prev.map((r) => r.idMeal));
                const uniqueItems = newItems.filter((i) => !existingIds.has(i.idMeal));
                return [...prev, ...uniqueItems];
              });
              const stillHasMore = endIndex < allRecipes.length;
              setHasMore(stillHasMore);
            } else {
              setHasMore(false);
            }
          }
        } finally {
          if (isSubscribed) setLoadingMore(false);
        }
      };
      
      loadMore();
    }

    return () => {
      isSubscribed = false;
    };
  }, [page, query, type, filterValue, allRecipes, sig]);

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
            <div ref={lastElementRef} className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <button 
                onClick={() => setPage(p => p + 1)}
                className="text-sm text-primary hover:underline"
              >
                Cargar más
              </button>
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-32 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
