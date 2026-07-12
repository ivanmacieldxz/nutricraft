"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MealDBService, MealPreview } from "@/services/mealdb";
import { RecipeCard } from "@/components/features/RecipeCard";

import { Suspense } from "react";

const ITEMS_PER_PAGE = 12;

// Caché global para mantener el estado de la grilla si el componente se desmonta 
// (ej. al navegar a una receta y volver, o si Suspense lo recarga).
const HOME_CACHE = {
  allRecipes: [] as MealPreview[],
  displayedRecipes: [] as MealPreview[],
  page: 1,
  hasMore: false,
  query: "",
  type: "",
  filterValue: "",
  isCached: false,
};

function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const filterValue = searchParams.get("filterValue") || "";

  const isSameQuery = 
    HOME_CACHE.isCached && 
    HOME_CACHE.query === query && 
    HOME_CACHE.type === type && 
    HOME_CACHE.filterValue === filterValue;

  const [allRecipes, setAllRecipes] = useState<MealPreview[]>(isSameQuery ? HOME_CACHE.allRecipes : []);
  const [displayedRecipes, setDisplayedRecipes] = useState<MealPreview[]>(isSameQuery ? HOME_CACHE.displayedRecipes : []);
  const [loading, setLoading] = useState(isSameQuery ? false : true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(isSameQuery ? HOME_CACHE.page : 1);
  const [hasMore, setHasMore] = useState(isSameQuery ? HOME_CACHE.hasMore : false);

  // Sincronizar estado con la caché
  useEffect(() => {
    HOME_CACHE.allRecipes = allRecipes;
    HOME_CACHE.displayedRecipes = displayedRecipes;
    HOME_CACHE.page = page;
    HOME_CACHE.hasMore = hasMore;
    HOME_CACHE.query = query;
    HOME_CACHE.type = type;
    HOME_CACHE.filterValue = filterValue;
    if (displayedRecipes.length > 0) {
      HOME_CACHE.isCached = true;
    }
  }, [allRecipes, displayedRecipes, page, hasMore, query, type, filterValue]);

  // Fetch initial results when search params change
  useEffect(() => {
    const fetchRecipes = async () => {
      // Si tenemos los mismos parámetros cacheados, no volver a fetchear la primera página
      if (HOME_CACHE.isCached && 
          HOME_CACHE.query === query && 
          HOME_CACHE.type === type && 
          HOME_CACHE.filterValue === filterValue) {
        return;
      }
      
      setLoading(true);
      setPage(1);
      try {
        if (!query && !type) {
          // Modo Descubrimiento Puro
          const data = await MealDBService.getTrulyRandomMeals(ITEMS_PER_PAGE);
          setDisplayedRecipes(data);
          setAllRecipes([]); 
          setHasMore(true);
        } else {
          // Modo Búsqueda y/o Filtro
          let data: MealPreview[] = [];
          
          if (type && filterValue) {
            // Se usa el filtro estricto a la API (Categoría, Ingrediente, Región)
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
            // Filtrado local cruzado si también hay un término de búsqueda (query)
            if (query) {
              const lowerQ = query.toLowerCase();
              data = (data || []).filter(r => r.strMeal.toLowerCase().includes(lowerQ));
            }
          } else if (query) {
            // Solo búsqueda por nombre
            data = await MealDBService.searchMeals(query);
          }
          
          const validData = data || [];
          setAllRecipes(validData);
          setDisplayedRecipes(validData.slice(0, ITEMS_PER_PAGE));
          setHasMore(validData.length > ITEMS_PER_PAGE);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setAllRecipes([]);
        setDisplayedRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [query, type, filterValue]);

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
        rootMargin: "800px" // Dispara la carga 800px antes de llegar al final
      });
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  // Escuchar cambios de página para cargar más
  useEffect(() => {
    if (page > 1) {
      const loadMore = async () => {
        setLoadingMore(true);
        try {
          if (!query && !type) {
            // Modo descubrimiento: Fetch real a la red
            const newItems = await MealDBService.getTrulyRandomMeals(ITEMS_PER_PAGE);
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
          } else {
            // Modo búsqueda y/o filtro: Paginación local
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const newItems = allRecipes.slice(startIndex, endIndex);
            
            if (newItems.length > 0) {
              setDisplayedRecipes((prev) => {
                const existingIds = new Set(prev.map((r) => r.idMeal));
                const uniqueItems = newItems.filter((i) => !existingIds.has(i.idMeal));
                return [...prev, ...uniqueItems];
              });
              setHasMore(endIndex < allRecipes.length);
            } else {
              setHasMore(false);
            }
          }
        } finally {
          setLoadingMore(false);
        }
      };
      
      loadMore();
    }
  }, [page, query, type, allRecipes]);

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
