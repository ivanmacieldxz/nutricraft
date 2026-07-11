# Requerimientos - NutriCraft

## Visión General
Aplicación web rápida y funcional para explorar recetas, filtrar por ingredientes disponibles, planificar comidas semanales, generar listas de compras integradas y analizar el perfil nutricional consolidado.

## Arquitectura de Pantallas y Módulos

### 1. Pantalla Principal / Exploración (`/`)
- **Sección "Mi Heladera" (Cocinar con lo que tengo):**
  - Widget superior/destacado para ingresar/seleccionar múltiples ingredientes a mano.
  - Filtra dinámicamente las recetas sugeridas según los ingredientes seleccionados.
- **Sección de Exploración General:**
  - Buscador global por texto libre.
  - Filtros por categoría (Desayuno, Pasta, Vegano, etc.) y área geográfica.
  - Tarjetas de recetas con vista previa (imagen, título, categoría/s).

### 2. Detalle de Receta (`/recipes/:id`)
- Vista completa del plato: imagen, ingredientes con medidas e instrucciones paso a paso.
- Información nutricional estimada agregada por porción (calculada mediante Open Food Facts).
- **Acciones Rápidas:**
  - Guardar / Desguardar receta (Favoritos).
  - Botón "Agregar a Plan Semanal" (despliega selector de día y comida).

### 3. Plan Semanal & Lista de Compras (`/meal-plan`)
- **Pestaña 1: Planificador Semanal:**
  - Grid de Lunes a Domingo dividido en Desayuno, Almuerzo, Merienda y Cena.
  - Permite asignar o quitar recetas en cada casilla.
- **Pestaña 2: Lista de Compras Automática (Integrada):**
  - Procesa automáticamente las recetas agregadas al plan de la semana.
  - Consolida y agrupa los ingredientes totales con sus cantidades.
  - Incluye checkboxes para marcar elementos ya comprados/obtenidos.

### 4. Dashboard Nutricional (`/nutrition-dashboard`)
- Gráficos y barras de progreso del consumo nutricional diario/semanal estimado.
- Comparativa de calorías, carbohidratos, proteínas y grasas frente a las metas fijadas en el perfil.
- Desglose de calidad nutricional (Nutri-Score general del plan).

### 5. Perfil y Preferencias Dietéticas (`/preferences`)
- Configuración de metas calóricas y de macronutrientes diarias.
- Selección de restricciones alimentarias (Vegetariano, Vegano, Sin Gluten) y alergias/ingredientes rechazados.
- Filtro automático en las búsquedas según las preferencias guardadas.

### 6. Recetas Guardadas e Historial (`/saved`)
- Pestañas para conmutar entre:
  - **Guardadas:** Recetas marcadas como favoritas.
  - **Historial:** Últimas recetas visitadas por el usuario.