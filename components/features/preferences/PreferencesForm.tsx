"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Target, Leaf, AlertCircle, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { updateUserPreferences } from "@/app/actions/preferences";

interface PreferencesFormProps {
  initialData: {
    dailyCalories: number | null;
    dailyCarbs: number | null;
    dailyProtein: number | null;
    dailyFat: number | null;
    diets: string[];
    allergies: string[];
  };
}

const COMMON_DIETS = [
  { id: "Vegetarian", label: "Vegetariano" },
  { id: "Vegan", label: "Vegano" },
];

export function PreferencesForm({ initialData }: PreferencesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState({
    dailyCalories: initialData.dailyCalories?.toString() || "",
    dailyCarbs: initialData.dailyCarbs?.toString() || "",
    dailyProtein: initialData.dailyProtein?.toString() || "",
    dailyFat: initialData.dailyFat?.toString() || "",
  });
  const [diets, setDiets] = useState<string[]>(initialData.diets || []);
  const [allergies, setAllergies] = useState<string[]>(initialData.allergies || []);
  const [allergyInput, setAllergyInput] = useState("");

  const handleGoalChange = (field: keyof typeof goals, value: string) => {
    // Solo permitir números
    if (value === "" || /^\d+$/.test(value)) {
      setGoals((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleDietToggle = (dietId: string) => {
    setDiets((prev) =>
      prev.includes(dietId) ? [] : [dietId]
    );
  };

  const handleAddAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && allergyInput.trim() !== "") {
      e.preventDefault();
      const newAllergy = allergyInput.trim().toLowerCase();
      if (!allergies.includes(newAllergy)) {
        setAllergies([...allergies, newAllergy]);
      }
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await updateUserPreferences({
        dailyCalories: goals.dailyCalories ? parseInt(goals.dailyCalories, 10) : null,
        dailyCarbs: goals.dailyCarbs ? parseInt(goals.dailyCarbs, 10) : null,
        dailyProtein: goals.dailyProtein ? parseInt(goals.dailyProtein, 10) : null,
        dailyFat: goals.dailyFat ? parseInt(goals.dailyFat, 10) : null,
        diets,
        allergies,
      });
      toast.success("Preferencias guardadas exitosamente");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar las preferencias");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sección Metas Nutricionales */}
      <section className="bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold">Metas Nutricionales Diarias</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Define tus objetivos diarios. Estos valores se utilizarán para calcular tu progreso en el dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Calorías (kcal)</label>
            <Input
              value={goals.dailyCalories}
              onChange={(e) => handleGoalChange("dailyCalories", e.target.value)}
              placeholder="Ej: 2000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Carbohidratos (g)</label>
            <Input
              value={goals.dailyCarbs}
              onChange={(e) => handleGoalChange("dailyCarbs", e.target.value)}
              placeholder="Ej: 250"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Proteínas (g)</label>
            <Input
              value={goals.dailyProtein}
              onChange={(e) => handleGoalChange("dailyProtein", e.target.value)}
              placeholder="Ej: 150"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Grasas (g)</label>
            <Input
              value={goals.dailyFat}
              onChange={(e) => handleGoalChange("dailyFat", e.target.value)}
              placeholder="Ej: 70"
            />
          </div>
        </div>
      </section>

      {/* Sección Restricciones y Dietas */}
      <section className="bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
            <Leaf className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold">Preferencias Dietéticas</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Selecciona tu dieta (solo puedes elegir una). Esto nos ayudará a filtrar las recetas sugeridas.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COMMON_DIETS.map((diet) => (
            <div key={diet.id} className="flex items-center space-x-2 p-3 border rounded-xl hover:bg-accent/50 transition-colors">
              <Checkbox
                id={diet.id}
                checked={diets.includes(diet.id)}
                onCheckedChange={() => handleDietToggle(diet.id)}
              />
              <label
                htmlFor={diet.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-grow cursor-pointer"
              >
                {diet.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Sección Alergias e Ingredientes */}
      <section className="bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-semibold">Alergias y Exclusiones</h2>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          Escribe un ingrediente que deseas evitar y presiona "Enter" para agregarlo a la lista.
        </p>

        <div className="space-y-4">
          <Input
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyDown={handleAddAllergy}
            placeholder="Ej: mani, lactosa, mariscos... (Presiona Enter)"
            className="max-w-md"
          />
          
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {allergies.length === 0 ? (
              <span className="text-sm text-muted-foreground italic flex items-center">Sin alergias registradas</span>
            ) : (
              allergies.map((allergy) => (
                <Badge key={allergy} variant="secondary" className="px-3 py-1.5 text-sm gap-1 pl-3 pr-2">
                  {allergy}
                  <button
                    onClick={() => handleRemoveAllergy(allergy)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors focus:outline-none"
                    aria-label={`Eliminar ${allergy}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full sm:w-auto px-8 rounded-xl">
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Guardando..." : "Guardar Preferencias"}
        </Button>
      </div>
    </div>
  );
}
