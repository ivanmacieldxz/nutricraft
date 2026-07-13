import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Nutricional</h2>
          <p className="text-muted-foreground mt-1">
            Monitoreá tu consumo estimado semanal frente a tus metas.
          </p>
        </div>
        <Skeleton className="h-10 w-48 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card/50 border rounded-2xl p-6 h-[400px]">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        <div className="lg:col-span-1 bg-card/50 border rounded-2xl p-6 h-[400px]">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
        <div className="lg:col-span-3 bg-card/50 border rounded-2xl p-6 h-[350px]">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
