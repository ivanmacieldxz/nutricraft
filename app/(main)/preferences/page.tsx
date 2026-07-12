import { getUserPreferences } from "@/app/actions/preferences";
import { PreferencesForm } from "@/components/features/preferences/PreferencesForm";

export default async function PreferencesPage() {
  const preferences = await getUserPreferences();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Perfil y Preferencias</h1>
        <p className="text-muted-foreground">
          Configura tus metas nutricionales y restricciones alimentarias para personalizar tu experiencia y recomendaciones.
        </p>
      </div>

      <PreferencesForm
        initialData={{
          dailyCalories: preferences.dailyCalories,
          dailyCarbs: preferences.dailyCarbs,
          dailyProtein: preferences.dailyProtein,
          dailyFat: preferences.dailyFat,
          diets: preferences.diets,
          allergies: preferences.allergies,
        }}
      />
    </div>
  );
}
