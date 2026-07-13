import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col xl:gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Planificador</h2>
          <p className="text-muted-foreground mt-1">
            Organizá tus comidas y generá tu lista de compras automáticamente.
          </p>
        </div>

        <div className="text-sm font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-xl border flex items-center shadow-sm">
          <Calendar className="w-4 h-4 mr-2" />
          Cargando semana...
        </div>
      </div>

      <div className="w-full mt-4">
        <div className="grid w-full grid-cols-2 max-w-md mx-auto bg-secondary/70 rounded-lg p-1">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>

        <div className="xl:mt-8 mt-4">
          <div className="flex flex-col border rounded-3xl overflow-hidden bg-card shadow-sm">
            {/* Header row skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-7 border-b divide-y xl:divide-y-0 xl:divide-x bg-muted/30">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="p-4 text-center">
                  <Skeleton className="h-5 w-16 mx-auto mb-2" />
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                </div>
              ))}
            </div>
            {/* Body skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-7 divide-y xl:divide-y-0 xl:divide-x">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="p-4 min-h-[300px] flex flex-col gap-3">
                  <Skeleton className="w-full h-24 rounded-2xl" />
                  <Skeleton className="w-full h-24 rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
