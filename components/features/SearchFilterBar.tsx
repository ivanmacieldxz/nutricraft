"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTranslatedCategories, getTranslatedAreas, getTranslatedIngredients } from "@/app/actions/translations";
import { TranslatedItem } from "@/services/translation";

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentQuery = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || ""; // "category", "region", "ingredient"
  const currentValue = searchParams.get("filterValue") || "";
  
  const [inputValue, setInputValue] = useState(currentQuery);
  const [showFilters, setShowFilters] = useState(false);
  
  // Data lists (Translated)
  const [categories, setCategories] = useState<TranslatedItem[]>([]);
  const [areas, setAreas] = useState<TranslatedItem[]>([]);
  const [ingredients, setIngredients] = useState<TranslatedItem[]>([]);
  
  const [selectedType, setSelectedType] = useState(currentType);
  const [selectedValue, setSelectedValue] = useState(currentValue);
  const [areaSearch, setAreaSearch] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");

  useEffect(() => {
    getTranslatedCategories().then(setCategories);
    getTranslatedAreas().then(setAreas);
    getTranslatedIngredients().then(setIngredients);
  }, []);

  useEffect(() => {
    setInputValue(currentQuery);
    setSelectedType(currentType);
    setSelectedValue(currentValue);
  }, [currentQuery, currentType, currentValue]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    
    if (inputValue.trim()) {
      params.set("q", inputValue.trim());
    } else {
      params.delete("q");
    }
    
    if (selectedType && selectedValue) {
      params.set("type", selectedType);
      params.set("filterValue", selectedValue);
    } else {
      params.delete("type");
      params.delete("filterValue");
    }
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleFilterSelect = (type: string, valueEn: string) => {
    let newType = type;
    let newValue = valueEn;
    
    // Toggle off if clicking the same chip
    if (selectedType === type && selectedValue === valueEn) {
      newType = "";
      newValue = "";
    }
    
    setSelectedType(newType);
    setSelectedValue(newValue);
    
    // Apply immediately
    const params = new URLSearchParams(searchParams);
    if (inputValue.trim()) params.set("q", inputValue.trim());
    else params.delete("q");
    
    if (newType && newValue) {
      params.set("type", newType);
      params.set("filterValue", newValue);
    } else {
      params.delete("type");
      params.delete("filterValue");
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const getTranslatedValue = (type: string, valueEn: string) => {
    if (!valueEn) return "";
    if (type === "category") return categories.find(c => c.en === valueEn)?.es || valueEn;
    if (type === "region") return areas.find(a => a.en === valueEn)?.es || valueEn;
    if (type === "ingredient") return ingredients.find(i => i.en === valueEn)?.es || valueEn;
    return valueEn;
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar receta por nombre..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 pr-9 h-11 bg-background rounded-xl border-muted focus-visible:ring-primary shadow-sm w-full transition-colors"
          />
          {inputValue && (
            <button 
              onClick={() => {
                setInputValue("");
                const params = new URLSearchParams(searchParams);
                params.delete("q");
                router.push(`/?${params.toString()}`, { scroll: false });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button 
          variant={showFilters || selectedType ? "default" : "outline"}
          size="icon" 
          onClick={() => setShowFilters(!showFilters)}
          className={cn("h-11 w-11 rounded-xl shadow-sm transition-all flex-shrink-0", (showFilters || selectedType) && "bg-primary text-primary-foreground")}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Panel Avanzado */}
      {showFilters && (
        <div className="p-5 bg-card/60 backdrop-blur-md border rounded-2xl flex flex-col gap-6 shadow-sm">
          
          {/* Categorías */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground/80">Categoría</span>
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent">
              {categories.map(cat => (
                <button
                  key={cat.en}
                  onClick={() => handleFilterSelect("category", cat.en)}
                  className={cn(
                    "px-4 py-1.5 text-sm rounded-full transition-all border shadow-sm whitespace-nowrap flex-shrink-0",
                    selectedType === "category" && selectedValue === cat.en 
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground hover:bg-secondary border-border"
                  )}
                >
                  {cat.es}
                </button>
              ))}
            </div>
          </div>

          {/* Región (Buscador en línea + Chips) */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground/80">Región / País</span>
            
            {selectedType === "region" && selectedValue ? (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
                  {getTranslatedValue("region", selectedValue)}
                  <button 
                    onClick={() => handleFilterSelect("region", selectedValue)}
                    className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Buscar país (ej. Italia)..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="h-11 bg-background rounded-xl border-muted focus-visible:ring-primary shadow-sm"
                />
                
                {areaSearch.trim() && (
                  <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent pr-2 pb-1">
                    {areas
                      .filter(a => a.es.toLowerCase().includes(areaSearch.toLowerCase()))
                      .map(area => (
                        <button
                          key={area.en}
                          onClick={() => {
                            handleFilterSelect("region", area.en);
                            setAreaSearch(""); 
                          }}
                          className="px-3 py-1.5 text-sm rounded-full bg-background text-foreground hover:bg-secondary border transition-all shadow-sm"
                        >
                          {area.es}
                        </button>
                      ))}
                    {areas.filter(a => a.es.toLowerCase().includes(areaSearch.toLowerCase())).length === 0 && (
                      <span className="text-sm text-muted-foreground px-2">No se encontraron regiones.</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ingredientes (Buscador en línea + Chips) */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground/80">Ingrediente Principal</span>
            
            {selectedType === "ingredient" && selectedValue ? (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow-sm flex items-center gap-2">
                  {getTranslatedValue("ingredient", selectedValue)}
                  <button 
                    onClick={() => handleFilterSelect("ingredient", selectedValue)}
                    className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="Escribe para buscar entre más de 500 ingredientes..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="h-11 bg-background rounded-xl border-muted focus-visible:ring-primary shadow-sm"
                />
                
                {/* Resultados filtrados en tiempo real con Scroll */}
                {ingredientSearch.trim() && (
                  <div className="flex flex-wrap gap-2 mt-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent pr-2 pb-1">
                    {ingredients
                      .filter(i => i.es.toLowerCase().includes(ingredientSearch.toLowerCase()))
                      .map(ingredient => (
                        <button
                          key={ingredient.en}
                          onClick={() => {
                            handleFilterSelect("ingredient", ingredient.en);
                            setIngredientSearch(""); 
                          }}
                          className="px-3 py-1.5 text-sm rounded-full bg-background text-foreground hover:bg-secondary border transition-all shadow-sm"
                        >
                          {ingredient.es}
                        </button>
                      ))}
                    {ingredients.filter(i => i.es.toLowerCase().includes(ingredientSearch.toLowerCase())).length === 0 && (
                      <span className="text-sm text-muted-foreground px-2">No hay resultados.</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
