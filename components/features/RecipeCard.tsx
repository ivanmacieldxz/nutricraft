import Image from "next/image";
import Link from "next/link";
import { MealPreview } from "@/services/mealdb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat } from "lucide-react";
import { areaToCountryEs } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecipeCardProps {
  recipe: MealPreview;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const displayArea = recipe.strArea ? (areaToCountryEs[recipe.strArea] || recipe.strArea) : null;

  return (
    <Card className="group relative overflow-hidden rounded-3xl border-transparent shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 aspect-square">
      <Image
        src={recipe.strMealThumb}
        alt={recipe.strMeal}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity group-hover:opacity-100"></div>

      {/* Content Superimposed */}
      <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col">
        <Tooltip>
          <TooltipTrigger className="text-left w-full cursor-default">
            <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
              {recipe.strMeal}
            </h3>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10} className="bg-background text-foreground max-w-[280px]">
            <p className="text-sm font-medium">{recipe.strMeal}</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center text-white/90 text-sm gap-1.5 font-medium drop-shadow-md">
            {displayArea && (
              <>
                <ChefHat className="w-4 h-4 text-primary" />
                {displayArea}
              </>
            )}
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
        </div>
      </div>
    </Card>
  );
}
