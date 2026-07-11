# Antigravity Rules & Coding Guidelines - Recetario & Plan Nutricional

## 1. Principios de Arquitectura y Estilado
- **Principios SOLID y Clean Code**: Mantén una estricta separación de responsabilidades entre la lógica de negocio (`domain`), la integración de APIs y persistencia (`infrastructure`/`services`) y los componentes visuales (`presentation`).
- **Tipado Estricto**: Usa TypeScript de forma estricta. Queda prohibido el uso de `any`. Define interfaces o tipos claros para todas las entidades (`Recipe`, `Ingredient`, `MealPlan`, `UserProfile`, `ShoppingItem`) y las props de los componentes.
- **Modularidad Visual**: Evita componentes monolíticos. Divide la interfaz en componentes pequeños, reutilizables y atómicos (ej. tarjeta de receta, barra de macros, selector de día, item de lista de compras).

## 2. Manejo de APIs, Cache y Errores
- **Variables de Entorno**: Las URLs base de las APIs (TheMealDB, Open Food Facts) y cualquier credencial o configuración deben consumirse exclusivamente mediante variables de entorno (`.env`).
- **Mapeo de Datos de APIs Externas**:
  - Los datos de TheMealDB y Open Food Facts NUNCA deben consumirse de forma directa en los componentes de la interfaz. Deben pasar siempre por capas de mapeo/DTOs hacia nuestros modelos internos.
- **Estrategia de Caché y Fallbacks**:
  - Implementa caché en memoria o `localStorage` para la información nutricional de Open Food Facts para evitar llamadas de red redundantes sobre el mismo ingrediente.
  - Si la API de Open Food Facts no retorna datos de un ingrediente o falla, la aplicación debe degradarse elegantemente mostrando un valor nulo/estimado por defecto sin romper la interfaz del detalle de la receta.
- **Manejo de Estados Asíncronos**:
  - Todo flujo de búsqueda o carga asíncrona debe manejar explícitamente estados de `loading` (skeletons/spinners), `error` y `success`.

## 3. Experiencia de Usuario (UX)
- **Diseño Mobile-First y Responsivo**: La app debe priorizar una interfaz limpia y ágil en dispositivos móviles (pensada para usarse mientras se cocina o en el supermercado) y adaptarse a pantallas de escritorio.
- **Estados Vacíos (*Empty States*)**: Provee visualizaciones claras cuando el plan semanal no tenga comidas asignadas, la lista de compras esté vacía o no haya recetas guardadas en favoritos.
- **Notificaciones sin Popups Nativos**: Queda estrictamente prohibido el uso de `window.alert`, `window.confirm` o `window.prompt`. Utiliza siempre componentes de UI (Toasts, Banners o Modales de la librería seleccionada) para dar feedback de acciones (ej. "Receta agregada al plan", "Ingrediente marcado").
- **Optimizaciones de Entrada**: Aplica un *debounce* (mínimo 300ms) en la ros modelos internos.
- **Estrategia de Caché y Fallbacks**:
  - Implementa caché en memoria o `localStorage` para la información nutricional de Open Food Facts para evitar llamadas de red redundantes sobre el mismo ingrediente.búsqueda de recetas en tiempo real y en el filtro de "Mi Heladera".

## 4. Reglas para Next.js App Router (si aplica)
- La carpeta `app/` solo debe contener definiciones de rutas, layouts y contenedores principales de página. Toda la lógica de negocio, clientes de API y componentes complejos deben residir dentro de `@/components`, `@/services` o `@/features`.
- Marca explícitamente con `'use client'` únicamente aquellos componentes que requieran interacción del usuario, hooks de React (`useState`, `useEffect`) o acceso al almacenamiento local (`localStorage`).