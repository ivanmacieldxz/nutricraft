"use server";

import { auth, currentUser } from "@clerk/nextjs/server";

async function ensureUserExists(userId: string) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || `${userId}@clerk.local`;
    await prisma.user.create({
      data: {
        id: userId,
        email,
      }
    });
  }
}
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MealDBService } from "@/services/mealdb";
import { translateArray } from "@/services/translation";

// ----------------------------------------------------------------------------
// PLANIFICADOR SEMANAL
// ----------------------------------------------------------------------------

export async function getMealPlan(weekStartDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const plan = await prisma.mealPlan.findFirst({
    where: {
      userId,
      weekStartDate,
    },
    include: {
      items: true,
    },
  });

  return plan;
}

export async function addRecipeToPlan({
  externalRecipeId,
  title,
  imageUrl,
  dayOfWeek,
  mealType,
  weekStartDate,
}: {
  externalRecipeId: string;
  title: string;
  imageUrl: string | null;
  dayOfWeek: number;
  mealType: string;
  weekStartDate: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Buscar o crear el plan de la semana
  let plan = await prisma.mealPlan.findFirst({
    where: { userId, weekStartDate },
  });

  if (!plan) {
    await ensureUserExists(userId);
    plan = await prisma.mealPlan.create({
      data: {
        userId,
        weekStartDate,
      },
    });
  }

  // Verificar si ya existe una receta en esa casilla
  const existingItem = await prisma.mealPlanItem.findFirst({
    where: {
      mealPlanId: plan.id,
      dayOfWeek,
      mealType,
    },
  });

  if (existingItem) {
    // Reemplazar la existente
    await prisma.mealPlanItem.update({
      where: { id: existingItem.id },
      data: {
        externalRecipeId,
        title,
        imageUrl,
      },
    });
  } else {
    // Crear una nueva
    await prisma.mealPlanItem.create({
      data: {
        mealPlanId: plan.id,
        dayOfWeek,
        mealType,
        externalRecipeId,
        title,
        imageUrl,
      },
    });
  }

  revalidatePath("/plans");
  return { success: true };
}

export async function removeRecipeFromPlan(itemId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const item = await prisma.mealPlanItem.findUnique({
    where: { id: itemId },
    include: { mealPlan: true },
  });

  if (!item || item.mealPlan.userId !== userId) {
    throw new Error("Not found or unauthorized");
  }

  await prisma.mealPlanItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/plans");
  return { success: true };
}

// ----------------------------------------------------------------------------
// LISTA DE COMPRAS
// ----------------------------------------------------------------------------

export async function getShoppingList(weekStartDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await prisma.shoppingList.findFirst({
    where: { userId, weekStartDate },
    include: {
      items: {
        orderBy: { ingredientName: "asc" }
      },
    },
  });
}

export async function generateShoppingList(weekStartDate: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // 1. Obtener todas las recetas del plan semanal
  const plan = await prisma.mealPlan.findFirst({
    where: { userId, weekStartDate },
    include: { items: true },
  });

  if (!plan || plan.items.length === 0) {
    return { success: false, message: "No hay recetas en el plan para esta semana." };
  }

  // 2. Fetch de ingredientes completos para cada receta (en paralelo)
  const recipeIds: string[] = Array.from(new Set(plan.items.map((i: { externalRecipeId: string }) => i.externalRecipeId)));
  const recipesDetails = await Promise.all(
    recipeIds.map(id => MealDBService.getMealById(id))
  );

  // 3. Consolidar ingredientes
  // Nota: TheMealDB no siempre da cantidades numéricas parseables (ej. "a pinch", "1/2 cup").
  // Vamos a agrupar por nombre de ingrediente y concatenar las medidas si son distintas, 
  // o intentar sumar si son numéricas. Por simplicidad de integración inicial, agruparemos 
  // por nombre y acumularemos las medidas como strings para que el usuario sepa cuánto necesita en total.
  
  const rawIngredientsMap = new Map<string, string[]>(); // key: ingredientName en inglés, value: array de measures

  recipesDetails.forEach(recipe => {
    if (!recipe) return;
    recipe.ingredients.forEach(ing => {
      const nameLower = ing.name.toLowerCase();
      const existingMeasures = rawIngredientsMap.get(nameLower) || [];
      if (ing.measure && ing.measure.trim() !== "") {
        existingMeasures.push(ing.measure.toLowerCase());
      }
      rawIngredientsMap.set(nameLower, existingMeasures);
    });
  });

  // 4. Traducción Dinámica de todos los ingredientes extraídos
  const enIngredients = Array.from(rawIngredientsMap.keys());
  
  // Usamos el servicio de traducción existente (que internamente llama a Google Translate o diccionario local)
  // formatAsList = false para que devuelva un array 1 a 1 sin capitalizar/deduplicar destructivamente todavía
  const translations = await translateArray(enIngredients, false);
  
  const translatedMap = new Map<string, string>();
  translations.forEach(t => {
    translatedMap.set(t.en.toLowerCase(), t.es);
  });

  // 5. Preparar los items para la base de datos
  const newShoppingListItems: { ingredientName: string, quantity: number, unit: string }[] = [];

  for (const [enName, measures] of rawIngredientsMap.entries()) {
    const esName = translatedMap.get(enName) || enName;
    const finalName = esName.charAt(0).toUpperCase() + esName.slice(1); // Capitalize
    
    // Tratamos de unificar measures repetidas
    const uniqueMeasures = Array.from(new Set(measures));
    const combinedMeasures = uniqueMeasures.length > 0 ? uniqueMeasures.join(" + ") : "A gusto";

    newShoppingListItems.push({
      ingredientName: finalName,
      quantity: 1, // Por diseño de Prisma schema actual, cantidad es Float, la usamos como 1 
      unit: combinedMeasures, // y guardamos la descripción en 'unit'
    });
  }

  // 6. Guardar en base de datos
  let shoppingList = await prisma.shoppingList.findFirst({
    where: { userId, weekStartDate },
  });

  if (shoppingList) {
    // Eliminar los items anteriores
    await prisma.shoppingListItem.deleteMany({
      where: { shoppingListId: shoppingList.id },
    });
  }
  if (!shoppingList) {
    await ensureUserExists(userId);
    shoppingList = await prisma.shoppingList.create({
      data: {
        userId,
        weekStartDate,
      },
    });
  }

  // Insertar los nuevos
  await prisma.shoppingListItem.createMany({
    data: newShoppingListItems.map(item => ({
      shoppingListId: shoppingList!.id,
      ...item,
    })),
  });

  revalidatePath("/plans");
  return { success: true };
}

export async function toggleShoppingListItem(itemId: string, isChecked: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const item = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
    include: { shoppingList: true },
  });

  if (!item || item.shoppingList.userId !== userId) {
    throw new Error("Not found or unauthorized");
  }

  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { isChecked },
  });

  revalidatePath("/plans");
  return { success: true };
}
