# NutriCraft 🥗

NutriCraft es una aplicación web rápida, funcional y progresiva (PWA) diseñada para explorar recetas, gestionar la heladera (despensa), planificar comidas semanales, generar listas de compras de manera automática y realizar un seguimiento del perfil nutricional del usuario.

## 🚀 Características Principales

- **Mi Heladera:** Cocina con lo que tienes. Filtra recetas basadas en los ingredientes que ya posees.
- **Exploración de Recetas:** Búsqueda global, filtros por categorías y dietas.
- **Planificador Semanal:** Organiza tus desayunos, almuerzos, meriendas y cenas para toda la semana.
- **Lista de Compras Automática:** A partir de tu plan semanal, se genera una lista consolidada de ingredientes con cantidades exactas.
- **Dashboard Nutricional:** Visualiza y analiza tu consumo calórico y de macronutrientes, integrado con CalorieNinjas.
- **Personalización:** Establece tus metas nutricionales, alergias y preferencias dietéticas.
- **Experiencia PWA:** Instalable en dispositivos móviles para una experiencia nativa y rápida en cualquier lugar.

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js (App Router), React, TypeScript.
- **Estilos y UI:** Componentes de Shadcn UI (Radix) complementados con Tailwind CSS para layout y diseño moderno.
- **Base de Datos:** PostgreSQL Serverless a través de Neon Database.
- **ORM:** Prisma.
- **Autenticación:** Clerk.
- **APIs de Datos:** TheMealDB (Recetas) y CalorieNinjas API (Información Nutricional).
- **Despliegue:** Vercel.

## 📱 Progressive Web App (PWA)

NutriCraft está construida con mentalidad Mobile-First y soporta funcionalidades PWA. Puedes instalar la aplicación en tu pantalla de inicio desde tu navegador móvil o de escritorio para acceder rápidamente y disfrutar de una experiencia inmersiva.

## 📖 Documentación

Puedes consultar nuestra documentación interna para más detalles sobre las reglas de desarrollo y la arquitectura del proyecto:

- [Requerimientos del Proyecto](docs/REQUIREMENTS.md)
- [Arquitectura y Modelos de Datos](docs/ARCHITECTURE.md)
- [Reglas de Agentes (.antigravity/rules.md)](.antigravity/rules.md)

## 💻 Desarrollo Local

Para correr el proyecto en tu entorno local:

1. **Clonar el repositorio y acceder a la carpeta:**
   ```bash
   git clone <repo-url>
   cd nutricraft
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Copia el archivo `.env.example` a `.env` y completa las credenciales necesarias (Neon DB URL, Clerk Keys, etc).

4. **Sincronizar Base de Datos:**
   ```bash
   npx prisma db push
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador:**
   Visita [http://localhost:3000](http://localhost:3000)
