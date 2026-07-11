import Image from "next/image";
import { MealPreview } from "@/services/mealdb";

interface RecipeCardProps {
  recipe: MealPreview;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="flex flex-col bg-surface-variant rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-full h-48">
        <Image
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-on-surface line-clamp-2">
          {recipe.strMeal}
        </h3>
        
        <div className="mt-auto pt-4 flex justify-end">
          {/* Usamos el componente oficial de MD3 (registrado en el wrapper) */}
          <md-filled-button href={`/recipes/${recipe.idMeal}`}>
            Ver Receta
          </md-filled-button>
        </div>
      </div>
    </div>
  );
}
