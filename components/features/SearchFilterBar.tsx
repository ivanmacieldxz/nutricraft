"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SearchFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentQuery = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "name";
  
  const [inputValue, setInputValue] = useState(currentQuery);
  const [searchType, setSearchType] = useState(currentType);

  useEffect(() => {
    setInputValue(currentQuery);
    setSearchType(currentType);
  }, [currentQuery, currentType]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (inputValue.trim()) {
      params.set("q", inputValue.trim());
      params.set("type", searchType);
    } else {
      params.delete("q");
      params.delete("type");
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    setInputValue("");
    router.push("/", { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              searchType === "name" ? "Buscar receta..." :
              searchType === "category" ? "Categoría (ej. Seafood)" :
              searchType === "ingredient" ? "Ingrediente (ej. Chicken)" :
              "Región (ej. Italian)"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 pr-9 h-11 bg-background rounded-xl border-muted focus-visible:ring-primary shadow-sm w-full transition-colors"
          />
          {inputValue && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl shadow-sm hover:bg-secondary hover:text-secondary-foreground transition-all flex-shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={searchType} onValueChange={setSearchType}>
              <DropdownMenuRadioItem value="name" className="cursor-pointer rounded-lg">Nombre</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="category" className="cursor-pointer rounded-lg">Categoría</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ingredient" className="cursor-pointer rounded-lg">Ingrediente principal</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="region" className="cursor-pointer rounded-lg">Región (País)</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Button onClick={handleSearch} className="w-full rounded-xl h-10 shadow-sm transition-all hover:scale-[1.01] active:scale-95">
        Buscar
      </Button>
    </div>
  );
}
