import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWeeklyNutritionStats, getUserPreferences } from "@/app/actions/nutrition";
import { NutritionDashboardView } from "@/components/features/nutrition/NutritionDashboardView";
import { PieChart, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // ajustar si es domingo
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default async function NutritionDashboardPage(props: {
  searchParams: Promise<{ week?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let weekStartDate = getMonday(new Date());
  if (searchParams.week) {
    weekStartDate = new Date(searchParams.week);
  }

  const [stats, preferences] = await Promise.all([
    getWeeklyNutritionStats(weekStartDate),
    getUserPreferences(),
  ]);

  if (!preferences || (!preferences.dailyCalories && !preferences.dailyCarbs && !preferences.dailyProtein && !preferences.dailyFat)) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <PieChart className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Estadísticas Nutricionales</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Para ver esta información, primero necesitas configurar tus metas de consumo diario.
        </p>
        <Link href="/preferences">
          <Button size="lg" className="rounded-xl shadow-sm hover:scale-[1.02] active:scale-95 transition-all gap-2">
            <Settings2 className="w-5 h-5" />
            Configurar Metas Nutricionales
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Nutricional</h2>
          <p className="text-muted-foreground mt-1">
            Monitoreá tu consumo estimado semanal frente a tus metas.
          </p>
        </div>

        <div className="text-sm font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-xl border flex items-center shadow-sm">
          Semana del {weekStartDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </div>
      </div>

      <NutritionDashboardView stats={stats} preferences={preferences} />
    </div>
  );
}
