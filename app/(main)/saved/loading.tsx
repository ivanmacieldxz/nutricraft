import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, Clock } from "lucide-react";

export default function Loading() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Tu Colección</h2>
        <p className="text-muted-foreground">
          Administra tus recetas favoritas y revisa las que has visitado recientemente.
        </p>
      </div>

      <div className="w-full">
        <div className="grid w-full max-w-md grid-cols-2 mb-8 bg-card border shadow-sm p-1 rounded-lg">
          <Skeleton className="h-8 w-full rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
