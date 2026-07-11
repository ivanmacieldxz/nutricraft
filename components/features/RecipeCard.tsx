import Image from "next/image";
import Link from "next/link";
import { MealPreview } from "@/services/mealdb";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";

interface RecipeCardProps {
  recipe: MealPreview;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="group overflow-hidden rounded-3xl border-transparent shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card">
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight">
            {recipe.strMeal}
          </h3>
        </div>
      </div>
      
      <CardContent className="p-0"></CardContent>
      
      <CardFooter className="p-4 bg-card flex justify-between items-center border-t border-muted/20">
        <div className="flex items-center text-muted-foreground text-sm gap-1.5 font-medium">
          <ChefHat className="w-4 h-4 text-primary" />
          TheMealDB
        </div>
        <Link href={`/recipes/${recipe.idMeal}`}>
          <Button 
            variant="secondary" 
            size="sm" 
            className="rounded-full font-semibold transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 active:scale-95 shadow-sm"
          >
            Ver Receta
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
