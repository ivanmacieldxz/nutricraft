"use client";

import { useState, useTransition } from "react";
import { ShoppingList, ShoppingListItem } from "@prisma/client";
import { generateShoppingList, toggleShoppingListItem, deleteShoppingListItem } from "@/app/actions/mealplan";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { RefreshCw, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShoppingListViewProps {
  shoppingList: (ShoppingList & { items: ShoppingListItem[] }) | null;
  weekStartDate: Date;
}

export function ShoppingListView({ shoppingList, weekStartDate }: ShoppingListViewProps) {
  const [isGenerating, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const res = await generateShoppingList(weekStartDate);
        if (!res.success) {
          toast.error(res.message || "Error al generar la lista");
        } else {
          toast.success("Lista generada y actualizada");
        }
      } catch (error) {
        toast.error("Error al generar la lista");
      }
    });
  };

  const handleToggle = async (itemId: string, currentStatus: boolean) => {
    try {
      await toggleShoppingListItem(itemId, !currentStatus);
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDelete = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    try {
      await deleteShoppingListItem(itemId);
      toast.success("Ítem eliminado");
    } catch (error) {
      toast.error("Error al eliminar ítem");
    }
  };

  const pendingItems = shoppingList?.items.filter(i => !i.isChecked) || [];
  const checkedItems = shoppingList?.items.filter(i => i.isChecked) || [];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 p-6 rounded-3xl border border-primary/10">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Lista Automática
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Basada en las recetas de tu planificador. Si agregaste o quitaste recetas, recordá actualizarla.
          </p>
        </div>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="rounded-full shrink-0"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating && "animate-spin")} />
          Actualizar Lista
        </Button>
      </div>

      {!shoppingList || shoppingList.items.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-3xl text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mx-auto opacity-20 mb-4" />
          <p className="text-lg font-medium">No hay items en la lista</p>
          <p className="text-sm opacity-80 mt-1">Agregá recetas a tu plan y actualizá la lista.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {pendingItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2">Pendientes ({pendingItems.length})</h3>
              <div className="grid gap-2">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id, item.isChecked)}
                    className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-secondary/50 cursor-pointer transition-colors group"
                  >
                    <Checkbox
                      checked={item.isChecked}
                      className="mt-0.5 pointer-events-none"
                    />
                    <div className="flex-1">
                      <p className="font-medium leading-none">{item.ingredientName}</p>
                      <p className="text-sm text-muted-foreground mt-1.5">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {checkedItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg border-b pb-2 text-muted-foreground">Comprados ({checkedItems.length})</h3>
              <div className="grid gap-2">
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id, item.isChecked)}
                    className="flex items-start gap-4 p-4 rounded-xl border border-transparent bg-muted/40 cursor-pointer transition-colors opacity-70 hover:opacity-100"
                  >
                    <Checkbox
                      checked={item.isChecked}
                      className="mt-0.5 pointer-events-none data-[state=checked]:bg-muted-foreground data-[state=checked]:border-muted-foreground"
                    />
                    <div className="flex-1">
                      <p className="font-medium leading-none line-through text-muted-foreground">{item.ingredientName}</p>
                      <p className="text-sm text-muted-foreground mt-1.5">{item.unit}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDelete(e, item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar ítem</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
