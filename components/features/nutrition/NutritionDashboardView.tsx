"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { WeeklyNutritionSummary } from "@/app/actions/nutrition";

interface Preferences {
  dailyCalories: number | null;
  dailyCarbs: number | null;
  dailyProtein: number | null;
  dailyFat: number | null;
}

interface Props {
  stats: WeeklyNutritionSummary;
  preferences: Preferences;
}

const COLORS = {
  carbs: "#3b82f6", // blue-500
  protein: "#f59e0b", // amber-500
  fat: "#ef4444", // red-500
  calories: "#10b981", // emerald-500
};

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function NutritionDashboardView({ stats, preferences }: Props) {
  const weeklyGoals = {
    calories: (preferences.dailyCalories || 0) * 7,
    carbs: (preferences.dailyCarbs || 0) * 7,
    protein: (preferences.dailyProtein || 0) * 7,
    fat: (preferences.dailyFat || 0) * 7,
  };

  const macroData = useMemo(() => [
    { name: "Carbohidratos", value: stats.totalCarbs, color: COLORS.carbs },
    { name: "Proteínas", value: stats.totalProtein, color: COLORS.protein },
    { name: "Grasas", value: stats.totalFat, color: COLORS.fat },
  ], [stats]);

  const weeklyData = useMemo(() => {
    return stats.daily.map((day, index) => ({
      name: DAYS[index].slice(0, 3), // Lun, Mar, etc.
      Calorías: day.calories,
      Carbohidratos: day.carbs,
      Proteínas: day.protein,
      Grasas: day.fat,
    }));
  }, [stats]);

  // Calculate generic Nutri-Score (mock logic based on meeting goals)
  const nutriScore = useMemo(() => {
    if (stats.totalCalories === 0) return "Sin datos";
    const calorieRatio = stats.totalCalories / (weeklyGoals.calories || 1);
    const proteinRatio = stats.totalProtein / (weeklyGoals.protein || 1);
    
    if (calorieRatio > 0.8 && calorieRatio < 1.2 && proteinRatio > 0.8) return "Excelente";
    if (calorieRatio > 0.7 && calorieRatio < 1.3) return "Buen Camino";
    if (calorieRatio > 0.5 && calorieRatio < 1.5) return "Necesita Ajuste";
    return "Revisar Dieta";
  }, [stats, weeklyGoals]);

  const getScoreColor = (score: string) => {
    switch (score) {
      case "Excelente": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "Buen Camino": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "Necesita Ajuste": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Revisar Dieta": return "text-red-500 bg-red-500/10 border-red-500/20";
      default: return "text-muted-foreground bg-secondary border-border";
    }
  };

  const ProgressBar = ({ label, current, goal, colorClass, unit }: any) => {
    const percentage = Math.min(Math.round((current / (goal || 1)) * 100), 100);
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">{Math.round(current)} / {goal} {unit}</span>
        </div>
        <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overview & Score Card */}
      <div className="lg:col-span-1 bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Resumen Semanal</h3>
          <div className={`px-4 py-1.5 rounded-full border font-bold text-sm ${getScoreColor(nutriScore)}`}>
            {nutriScore}
          </div>
        </div>
        
        <div className="space-y-6 flex-1">
          <ProgressBar 
            label="Calorías" 
            current={stats.totalCalories} 
            goal={weeklyGoals.calories} 
            colorClass="bg-emerald-500" 
            unit="kcal" 
          />
          <ProgressBar 
            label="Carbohidratos" 
            current={stats.totalCarbs} 
            goal={weeklyGoals.carbs} 
            colorClass="bg-blue-500" 
            unit="g" 
          />
          <ProgressBar 
            label="Proteínas" 
            current={stats.totalProtein} 
            goal={weeklyGoals.protein} 
            colorClass="bg-amber-500" 
            unit="g" 
          />
          <ProgressBar 
            label="Grasas" 
            current={stats.totalFat} 
            goal={weeklyGoals.fat} 
            colorClass="bg-red-500" 
            unit="g" 
          />
        </div>
      </div>

      {/* Macro Split Chart */}
      <div className="lg:col-span-1 bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
        <h3 className="font-semibold text-lg w-full text-left mb-2">Distribución de Macros</h3>
        <div className="w-full h-[250px] relative">
          {stats.totalCarbs === 0 && stats.totalProtein === 0 && stats.totalFat === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Sin datos para mostrar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                  formatter={(value: any) => [`${Math.round(value as number)}g`, undefined]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
          {macroData.map((macro, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }} />
              <span className="text-muted-foreground">{macro.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Daily Breakdown */}
      <div className="lg:col-span-3 bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-6">Evolución Diaria</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
              <YAxis yAxisId="left" orientation="left" stroke="none" tick={{ fill: 'hsl(var(--emerald-500))', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke="none" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--secondary))' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar yAxisId="left" dataKey="Calorías" fill={COLORS.calories} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="right" dataKey="Carbohidratos" fill={COLORS.carbs} radius={[4, 4, 0, 0]} stackId="macros" barSize={20} />
              <Bar yAxisId="right" dataKey="Proteínas" fill={COLORS.protein} radius={[4, 4, 0, 0]} stackId="macros" barSize={20} />
              <Bar yAxisId="right" dataKey="Grasas" fill={COLORS.fat} radius={[4, 4, 0, 0]} stackId="macros" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
