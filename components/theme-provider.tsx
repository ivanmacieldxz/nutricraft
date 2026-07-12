"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Se usa type any o ComponentProps para evitar conflictos con la v14 de next-themes si los hay
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
