"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserPreferences() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let preferences = await prisma.preferences.findUnique({
    where: { userId },
  });

  if (!preferences) {
    preferences = await prisma.preferences.create({
      data: {
        userId,
        diets: [],
        allergies: [],
      },
    });
  }

  return preferences;
}

export async function updateUserPreferences(data: {
  dailyCalories?: number | null;
  dailyCarbs?: number | null;
  dailyProtein?: number | null;
  dailyFat?: number | null;
  diets: string[];
  allergies: string[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const updated = await prisma.preferences.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });

  revalidatePath("/preferences");
  revalidatePath("/nutrition-dashboard");
  return updated;
}
