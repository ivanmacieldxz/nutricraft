import { getSavedRecipes, getRecipeHistory } from "@/app/actions/saved";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard } from "@/components/features/RecipeCard";
import { Bookmark, Clock } from "lucide-react";
import { HistoryList } from "./HistoryList";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const savedRecipes = await getSavedRecipes();
  const initialHistory = await getRecipeHistory(1, 10);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Tu Colección</h2>
        <p className="text-muted-foreground">
          Administra tus recetas favoritas y revisa las que has visitado recientemente.
        </p>
      </div>

      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-card/50 backdrop-blur-xl border shadow-sm">
          <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Bookmark className="w-4 h-4 mr-2" />
            Guardadas ({savedRecipes.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Clock className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-0 outline-none">
          {savedRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-card/40 rounded-3xl border border-dashed gap-4 backdrop-blur-sm">
              <Bookmark className="w-12 h-12 text-muted-foreground/50" />
              <span className="text-muted-foreground font-medium text-lg">No tienes recetas guardadas.</span>
              <p className="text-muted-foreground/80 text-sm">Explora recetas y usa el ícono para guardarlas aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedRecipes.map((recipe) => (
                <RecipeCard 
                  key={recipe.externalRecipeId} 
                  recipe={{
                    idMeal: recipe.externalRecipeId,
                    strMeal: recipe.title,
                    strMealThumb: recipe.imageUrl || "",
                  }} 
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0 outline-none">
          <HistoryList initialData={initialHistory.items} initialHasMore={initialHistory.hasMore} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
