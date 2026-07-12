"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Refrigerator, Home, Calendar, Bookmark, Settings, Menu } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { SearchFilterBar } from "@/components/features/SearchFilterBar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Planes de Comida", href: "/plans", icon: Calendar },
  { name: "Guardados", href: "/saved", icon: Bookmark },
  { name: "Preferencias", href: "/preferences", icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Desktop Sidebar (md and up) */}
      <aside className="hidden md:flex flex-col w-72 fixed inset-y-0 left-0 border-r bg-card/50 backdrop-blur-xl z-50">
        <Link href="/" className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <Refrigerator className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">NutriCraft</h1>
        </Link>

        <div className="px-6 pb-6">
          <Suspense fallback={<div className="h-11 w-full bg-muted animate-pulse rounded-xl" />}>
            <SearchFilterBar />
          </Suspense>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
                  <Icon className="w-5 h-5" />
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t flex items-center justify-between mt-auto">
          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <UserButton />
              <span className="text-sm font-medium">Mi Perfil</span>
            </div>
          ) : (
            <Link href="/sign-in" className="w-full">
              <Button className="w-full rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm">
                Entrar
              </Button>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile Header and Sub-bar */}
      <div className="flex flex-col md:hidden w-full fixed top-0 left-0 z-50">
        <header className="flex items-center justify-between p-4 px-5 border-b bg-background/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="w-5 h-5" />
                </Button>
              } />
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <Link href="/" className="p-6 flex items-center gap-3 border-b hover:opacity-80 transition-opacity">
                  <div className="bg-primary/20 p-2 rounded-xl text-primary">
                    <Refrigerator className="w-6 h-6" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">NutriCraft</h1>
                </Link>
                <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link key={link.href} href={link.href}>
                        <span className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}>
                          <Icon className="w-5 h-5" />
                          {link.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Refrigerator className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold tracking-tight text-foreground">NutriCraft</h1>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isSignedIn ? (
              <UserButton />
            ) : (
              <Link href="/sign-in">
                <Button size="sm" className="rounded-full shadow-sm hover:scale-[1.02] active:scale-95 transition-all">
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile Search/Filter sub-bar */}
        <div className="bg-background/80 backdrop-blur-md border-b p-4 shadow-sm">
          <Suspense fallback={<div className="h-11 w-full bg-muted animate-pulse rounded-xl" />}>
            <SearchFilterBar />
          </Suspense>
        </div>
      </div>

      {/* Main Content Area */}
      {/* Añadimos padding superior en mobile para compensar el header fixed (Header ~65px + Sub-bar ~100px = ~165px) */}
      <main className="flex-1 md:ml-72 pt-[170px] md:pt-0 min-h-screen">
        {children}
      </main>

    </div>
  );
}
