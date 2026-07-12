# Arquitectura de NutriCraft

Este documento define la arquitectura, los modelos de datos y la estrategia de integración de servicios para NutriCraft, asegurando el cumplimiento de las reglas de desarrollo y requerimientos establecidos.

## 1. Stack Tecnológico

*   **Framework Core:** Next.js (App Router) para SSR/SSG, enrutamiento y API Routes.
*   **Lenguaje:** TypeScript (Tipado estricto).
*   **Estilos y UI:** Tailwind CSS y Shadcn UI (Radix) para componentes modulares accesibles y diseño moderno (glassmorphism).
*   **Iconografía:** Lucide React.
*   **Base de Datos:** PostgreSQL alojado en Neon (Serverless Postgres).
*   **ORM:** Prisma ORM para acceso a datos seguro y tipado.
*   **Autenticación:** Clerk Auth (manejo de sesiones, login/registro y perfiles).
*   **APIs Externas:**
    *   **TheMealDB:** Fuente principal de recetas.
    *   **CalorieNinjas:** Fuente de información nutricional por ingredientes.
*   **Despliegue:** Vercel.
*   **PWA (Progressive Web App):** Configurado vía `@ducanh2912/next-pwa` (o similar compatible con App Router) y un `manifest.json` para permitir la instalación en dispositivos móviles y funcionamiento offline básico.

---

## 2. Modelos de Datos (Prisma Schema)

Los datos de los usuarios y sus planes residirán en nuestra base de datos relacional. Los datos de las recetas serán primordialmente externos, pero guardaremos referencias a ellas (ej. `externalRecipeId`).

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String          @id // Clerk User ID
  email            String          @unique
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  preferences      Preferences?
  mealPlans        MealPlan[]
  savedRecipes     SavedRecipe[]
  shoppingLists    ShoppingList[]
  recipeHistory    RecipeHistory[]
}

model Preferences {
  id               String   @id @default(uuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyCalories    Int?
  dailyCarbs       Int?
  dailyProtein     Int?
  dailyFat         Int?
  diets            String[] // ej. ["vegan", "gluten-free"]
  allergies        String[] // ej. ["peanuts", "shellfish"]
}

model SavedRecipe {
  id               String   @id @default(uuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  externalRecipeId String   // ID de TheMealDB
  title            String   // Cacheado para no llamar a la API
  imageUrl         String?
  savedAt          DateTime @default(now())
  
  @@unique([userId, externalRecipeId])
}

model MealPlan {
  id               String         @id @default(uuid())
  userId           String
  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  weekStartDate    DateTime       // Fecha del lunes de la semana
  items            MealPlanItem[]
}

model MealPlanItem {
  id               String   @id @default(uuid())
  mealPlanId       String
  mealPlan         MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  dayOfWeek        Int      // 0 = Lunes, 6 = Domingo
  mealType         String   // "breakfast", "lunch", "snack", "dinner"
  externalRecipeId String   // ID de TheMealDB
  title            String   // Cacheado
  imageUrl         String?
}

model ShoppingList {
  id               String             @id @default(uuid())
  userId           String
  user             User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  weekStartDate    DateTime           // A qué semana corresponde
  items            ShoppingListItem[]
}

model ShoppingListItem {
  id               String       @id @default(uuid())
  shoppingListId   String
  shoppingList     ShoppingList @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  ingredientName   String
  quantity         Float
  unit             String
  isChecked        Boolean      @default(false)
  isHidden         Boolean      @default(false)
}

model RecipeHistory {
  id               String   @id @default(uuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  externalRecipeId String   // ID de TheMealDB
  title            String
  imageUrl         String?
  visitedAt        DateTime @default(now())

  @@unique([userId, externalRecipeId])
}
```

---

## 3. Integración de Servicios de Terceros

### 3.1. Autenticación (Clerk)
*   **Flujo:** El usuario se autentica vía Clerk (Google, Email, etc.). Clerk maneja la sesión vía JWT/Cookies de forma nativa en Next.js.
*   **Sincronización:** Utilizaremos Clerk Webhooks (vía API Route en Next.js) para escuchar el evento `user.created` y crear el registro correspondiente en nuestra tabla `User` de Prisma.

### 3.2. Base de Datos (Neon + Prisma)
*   Se usará Prisma Client para interactuar con Neon DB.
*   En Next.js (Serverless), instanciamos el cliente de Prisma de forma global (`globalThis.prisma`) para evitar agotar las conexiones de la base de datos durante el desarrollo (hot-reloads).
*   Se aprovechará el connection pooling provisto por Neon o Prisma Accelerate si fuera necesario.

### 3.3. APIs de Recetas e Ingredientes (Capa de Adaptación)
De acuerdo a las reglas del proyecto (`rules.md`), los datos de TheMealDB y CalorieNinjas **no se consumirán directamente** en el Frontend.
*   **Capa de Servicios (`@/services/`):** Crearemos clases o funciones para consultar estas APIs (ej. `MealDBService.getRecipeById(id)`).
*   **DTOs y Mapeo:** Transformaremos las respuestas de la API en modelos internos (ej. unificando los campos `strIngredient1...20` de TheMealDB en un array estructurado de ingredientes).
*   **Caché:**
    *   La información de los ingredientes (CalorieNinjas) se consultará de forma unificada agrupando ingredientes, y puede almacenarse temporalmente para minimizar llamadas a la API.
    *   Fallbacks implementados: Si CalorieNinjas no retorna datos, se devolverá null y la UI reflejará que no hay datos disponibles.

### 3.4. PWA (Progressive Web App)
Para lograr la instalación en dispositivos móviles y una experiencia app-like:
*   Se configurará el plugin `next-pwa` (o su equivalente más moderno `@ducanh2912/next-pwa`) en `next.config.ts`.
*   Se incluirá un archivo `public/manifest.json` definiendo el nombre "NutriCraft", iconos, colores del tema (siguiendo MD3) y `display: "standalone"`.
*   Se agregarán las etiquetas meta necesarias en el layout principal (`app/layout.tsx`).

### 3.5. Shadcn UI (Radix) & Tailwind CSS
*   Se utilizará la librería **Shadcn UI** basada en componentes sin estilos de Radix UI para garantizar accesibilidad (a11y) y control total sobre el marcado.
*   Tailwind CSS se utiliza para orquestar un diseño moderno con enfoque en transparencias, bordes suaves (glassmorphism) y modo oscuro fluido mediante CSS variables.

---

## 4. Estructura de Directorios Propuesta

```
/
├── app/                  # Next.js App Router (Páginas, Layouts, API Routes)
│   ├── api/              # Endpoints (ej. webhooks de clerk, trpc/endpoints)
│   ├── (auth)/           # Rutas de login/registro (Clerk)
│   ├── (main)/           # Rutas principales (/meal-plan, /nutrition-dashboard, /saved, etc)
│   └── layout.tsx        # Layout root, meta tags para PWA
├── components/           # Componentes de UI (Atómicos y complejos)
│   ├── ui/               # Componentes base (Shadcn UI)
│   └── features/         # Componentes específicos de un dominio (ej. RecipeCard)
├── lib/                  # Utilidades y configuración
│   ├── prisma.ts         # Instancia de Prisma
│   └── utils.ts          # Funciones helper (Tailwind merge, etc)
├── services/             # Integración con APIs externas (TheMealDB, Open Food Facts)
├── types/                # Interfaces y tipos TypeScript
├── prisma/               # Schema de DB
└── public/               # Assets, iconos, manifest.json para PWA
```
