"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Guarda o desguarda una receta
 */
export async function toggleSavedRecipe(externalRecipeId: string, title: string, imageUrl: string | undefined | null) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("No autenticado");
  }

  const existing = await prisma.savedRecipe.findUnique({
    where: {
      userId_externalRecipeId: {
        userId,
        externalRecipeId,
      },
    },
  });

  if (existing) {
    await prisma.savedRecipe.delete({
      where: {
        id: existing.id,
      },
    });
    revalidatePath("/saved");
    revalidatePath(`/recipes/${externalRecipeId}`);
    return { saved: false };
  } else {
    await prisma.savedRecipe.create({
      data: {
        userId,
        externalRecipeId,
        title,
        imageUrl,
      },
    });
    revalidatePath("/saved");
    revalidatePath(`/recipes/${externalRecipeId}`);
    return { saved: true };
  }
}

/**
 * Verifica si una receta está guardada
 */
export async function isRecipeSaved(externalRecipeId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const existing = await prisma.savedRecipe.findUnique({
    where: {
      userId_externalRecipeId: {
        userId,
        externalRecipeId,
      },
    },
  });

  return !!existing;
}

/**
 * Obtiene todas las recetas guardadas
 */
export async function getSavedRecipes() {
  const { userId } = await auth();
  if (!userId) return [];

  return prisma.savedRecipe.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
  });
}

/**
 * Registra o actualiza la visita a una receta en el historial
 */
export async function addRecipeToHistory(externalRecipeId: string, title: string, imageUrl: string | undefined | null) {
  const { userId } = await auth();
  if (!userId) return; // Si no hay usuario, no hacemos nada silenciosamente

  await prisma.recipeHistory.upsert({
    where: {
      userId_externalRecipeId: {
        userId,
        externalRecipeId,
      },
    },
    update: {
      visitedAt: new Date(),
    },
    create: {
      userId,
      externalRecipeId,
      title,
      imageUrl,
    },
  });
}

/**
 * Obtiene el historial paginado de a 10 recetas
 */
export async function getRecipeHistory(page: number = 1, limit: number = 10) {
  const { userId } = await auth();
  if (!userId) {
    return {
      items: [],
      hasMore: false,
    };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.recipeHistory.findMany({
      where: { userId },
      orderBy: { visitedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.recipeHistory.count({
      where: { userId },
    }),
  ]);

  return {
    items,
    hasMore: skip + items.length < total,
  };
}
