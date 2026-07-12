"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleSavedRecipe, isRecipeSaved } from "@/app/actions/saved";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function SaveRecipeButton({ 
  idMeal, 
  strMeal, 
  strMealThumb 
}: { 
  idMeal: string; 
  strMeal: string; 
  strMealThumb: string 
}) {
  const { isSignedIn } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      isRecipeSaved(idMeal).then(saved => {
        setIsSaved(saved);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isSignedIn, idMeal]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isSignedIn) {
      toast.error("Debes iniciar sesión para guardar recetas.");
      return;
    }

    // Optimistic UI update
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);
    
    try {
      const res = await toggleSavedRecipe(idMeal, strMeal, strMealThumb);
      setIsSaved(res.saved);
      if (res.saved) {
        toast.success("Receta guardada en tus favoritas");
      }
    } catch (error) {
      setIsSaved(prevSaved);
      toast.error("Error al guardar receta");
    }
  };

  if (loading) {
    return (
      <div className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm animate-pulse" />
    );
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "absolute top-3 right-3 z-10 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-110 h-10 w-10 border",
        isSaved 
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
          : "bg-white/20 text-white border-white/30 hover:bg-white/30"
      )}
      onClick={handleSave}
    >
      <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
      <span className="sr-only">Guardar receta</span>
    </Button>
  );
}
