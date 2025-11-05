"use client";

import Link from "next/link";
import { type User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  CornerLeftUp,
  LayoutList,
  PlusCircle,
  LogOut,
  LogIn,
  Menu,
  Kanban,
  X,
  Activity,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header({
  user,
  isAdmin,
}: {
  user: User | null;
  isAdmin: boolean;
}) {
  const navLinks = (
    <div className="space-y-1">
      <Button
        asChild
        variant="ghost"
        className="w-full justify-start gap-3 h-auto py-3 rounded-xl"
      >
        <Link href="/dashboard">
          <div className="flex flex-row gap-3 items-center">
            <Kanban className="size-4 text-muted-foreground" />
            Dashboard
          </div>
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className="w-full justify-start gap-3 h-auto py-3 rounded-xl"
      >
        <Link href="/review">
          <div className="flex flex-row gap-3 items-center">
            <CornerLeftUp className="size-4 text-muted-foreground" />
            Revisão (Questões)
          </div>
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        className="w-full justify-start gap-3 h-auto py-3 rounded-xl"
      >
        <Link href="/notebook">
          <div className="flex flex-row gap-3 items-center">
            <LayoutList className="size-4 text-muted-foreground" />
            Meu Caderno
          </div>
        </Link>
      </Button>

      {isAdmin && (
        <>
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground tracking-wider mt-5">
            Para administração
          </div>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3 rounded-xl"
          >
            <Link href="/questions">
              <div className="flex flex-row gap-3 items-center">
                <PlusCircle className="size-4 text-muted-foreground" />
                Questões
              </div>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3 rounded-xl"
          >
            <Link href="/subjects">
              <div className="flex flex-row gap-3 items-center">
                <Activity className="size-4 text-muted-foreground" />
                Sessões
              </div>
            </Link>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <header className="w-full bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Brand Section */}
          <Link href="/" className="flex items-center space-x-1 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-103">
              <span className="text-white font-bold text-md">Os</span>
            </div>
            <span className="text-md font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent transition-transform duration-200 group-hover:scale-105 dark:from-gray-100 dark:to-gray-400">
              lo
            </span>
          </Link>

          {/* Container de Ações da Direita */}
          <div className="flex items-center gap-2">
            {user ? (
              <>

                {/* Navegação Desktop */}
                <nav className="hidden md:flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm" radius="full" className="gap-2">
                    <Link href="/dashboard">
                      <Kanban className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" radius="full"  className="gap-2">
                    <Link href="/review">
                      <CornerLeftUp className="h-4 w-4" />
                      Revisão
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" radius="full"  className="gap-2">
                    <Link href="/notebook">
                      <LayoutList className="h-4 w-4" />
                      Caderno
                    </Link>
                  </Button>

                  {isAdmin && (
                    <>
                      <div className="w-px h-8 bg-border mx-2" />

                      <Button asChild variant="ghost" size="sm" radius="full" className="gap-2"
                      >
                        <Link href="/questions">
                          <PlusCircle className="h-4 w-4" />
                          Questões
                        </Link>
                      </Button>
                    </>
                  )}
                  {isAdmin && (
                    <Button asChild variant="ghost" size="sm" radius="full" className="gap-2">
                      <Link href="/subjects">
                        <Activity className="h-4 w-4" />
                        Sessões
                      </Link>
                    </Button>
                  )}
                </nav>

                {/* Ações do Usuário Desktop */}
                <div className="hidden md:flex items-center gap-3 border-l border-border pl-3 ml-1">
                  <ThemeToggle />
                  <div className="relative group">
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary to-muted rounded-full flex items-center justify-center border border-border cursor-pointer transition-all duration-200 hover:shadow-md">
                      <span className="text-xs font-medium text-muted-foreground">
                        {user.email?.charAt(0)}
                      </span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none dark:bg-gray-800 z-50">
                      {user.email}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                    </div>
                  </div>
                  <form action={signOut}>
                    <Button variant="outline" size="sm" radius="full" className="gap-3">
                      <LogOut className="h-4 w-4" />
                      Sair
                    </Button>
                  </form>
                </div>

                {/* Gatilho do Menu Mobile */}
                <div className="md:hidden flex items-center gap-2">
                  <ThemeToggle />
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">
                          Abrir menu
                        </span>
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-300 dark:bg-blue-800 rounded-full border-2 border-card"></span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-[85vw] max-w-sm flex flex-col p-0"
                    >
                      <SheetHeader className="text-left p-4 border-b">
                        <SheetTitle className="sr-only">
                          Menu
                        </SheetTitle>
                        
                        <SheetDescription className="sr-only">
                          Navegação principal e opções de conta.
                        </SheetDescription>

                        <div className="flex items-center gap-3 px-4 pt-4 pb-1">
                          {/* Brand Section */}
                          <Link href="/" className="flex items-center space-x-1 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-103">
                              <span className="text-white font-bold text-lg">Os</span>
                            </div>
                            <span className="text-lg font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent transition-transform duration-200 group-hover:scale-105 dark:from-gray-100 dark:to-gray-400">
                              lo
                            </span>
                          </Link>
                        </div>
                      </SheetHeader>

                      <div className="flex-1 overflow-y-auto px-4">
                        {navLinks}
                      </div>

                      <div className="p-4 border-t space-y-2">
                        <form action={signOut} className="w-full">
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-400 dark:hover:bg-red-950/50"
                          >
                            <LogOut className="h-4 w-4" />
                            Sair
                          </Button>
                        </form>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (

              // Ações para visitantes
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Link href="/login">
                  <Button radius="full" size="sm" className="gap-3">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
); }