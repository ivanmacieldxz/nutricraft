import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Perfil y Preferencias</h1>
        <p className="text-muted-foreground">
          Configura tus metas nutricionales y restricciones alimentarias para personalizar tu experiencia y recomendaciones.
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
