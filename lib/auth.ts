import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Función que asegura que el usuario autenticado en Clerk
 * exista en la base de datos de Neon (Prisma). Si no existe, lo crea de forma "lazy".
 * Debe ser llamada en rutas protegidas o Server Actions que requieran acceso a DB.
 */
export async function syncAndGetUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Verifica si el usuario ya existe en Prisma
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (existingUser) {
    return existingUser;
  }

  // Si no existe, trae los datos de Clerk para crearlo
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Obtenemos el email primario
  const email = user.emailAddresses[0]?.emailAddress || "no-email@nutricraft.com";

  // Creamos al usuario en la base de datos
  const newUser = await prisma.user.create({
    data: {
      id: userId,
      email: email,
    },
  });

  return newUser;
}
