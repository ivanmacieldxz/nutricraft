import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMealPlan, getShoppingList } from "@/app/actions/mealplan";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyGrid } from "@/components/features/meal-plan/WeeklyGrid";
import { ShoppingListView } from "@/components/features/meal-plan/ShoppingListView";
import { Calendar, ShoppingBag } from "lucide-react";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // ajustar si es domingo
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function PlansPage(props: {
  searchParams: Promise<{ week?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Si no hay ?week en la url, usamos la semana actual (lunes)
  let weekStartDate = getMonday(new Date());
  if (searchParams.week) {
    weekStartDate = new Date(searchParams.week);
  }

  // Obtenemos los datos del servidor (RSC)
  const [mealPlan, shoppingList] = await Promise.all([
    getMealPlan(weekStartDate),
    getShoppingList(weekStartDate)
  ]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col xl:gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Planificador</h2>
          <p className="text-muted-foreground mt-1">
            Organizá tus comidas y generá tu lista de compras automáticamente.
          </p>
        </div>

        <div className="text-sm font-medium bg-secondary/50 backdrop-blur-xl text-secondary-foreground px-4 py-2 rounded-xl border border-secondary/20 flex items-center shadow-sm">
          <Calendar className="w-4 h-4 mr-2" />
          Semana del {weekStartDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </div>
      </div>

      <Tabs defaultValue="planner" className="w-full mt-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8 bg-card/50 backdrop-blur-xl border shadow-sm">
          <TabsTrigger value="planner" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <Calendar className="w-4 h-4 mr-2" />
            Plan Semanal
          </TabsTrigger>
          <TabsTrigger value="shopping" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Lista de Compras
          </TabsTrigger>
        </TabsList>

        <div className="xl:mt-8">
          <TabsContent value="planner" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <WeeklyGrid plan={mealPlan} weekStartDate={weekStartDate} />
          </TabsContent>

          <TabsContent value="shopping" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <ShoppingListView shoppingList={shoppingList} weekStartDate={weekStartDate} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
