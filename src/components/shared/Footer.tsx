import {
  Github,
  Instagram,
  Linkedin,
  Mail,
  LayoutList,
  Kanban,
  CornerLeftUp,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { type User } from "@supabase/supabase-js";

export default function Footer({ user }: { user: User | null }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-card/80 backdrop-blur-md border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand Section */}
          <div className="md:col-span-2 space-y-4">
            <Link
              href={user ? "/dashboard" : "/"}
              className="flex items-center space-x-1 group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-xl">Os</span>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent transition-transform duration-200 group-hover:scale-105 dark:from-gray-100 dark:to-gray-400">
                lo
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
              Simplificando seus estudos com ferramentas inteligentes para
              revisão e organização de materiais.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="mailto:ed320819@gmail.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">ed320819@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Navegação</h3>
            <div className="space-y-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group text-sm"
                  >
                    <Kanban className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Dashboard
                  </Link>
                  <Link
                    href="/review"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group text-sm"
                  >
                    <CornerLeftUp className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Revisão
                  </Link>
                  <Link
                    href="/notebook"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group text-sm"
                  >
                    <LayoutList className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Caderno
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group text-sm"
                >
                  <LogIn className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Connect Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Social</h3>
            <p className="text-muted-foreground text-sm">
              Iniciativa Eduardo Dourado.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="https://www.instagram.com/efdourado"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-muted-foreground group-hover:text-pink-600 transition-colors" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/efdourado"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
              </Link>
              <Link
                href="https://github.com/efdourado"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2 rounded-lg bg-secondary hover:bg-muted transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                © {currentYear} Oslo. Todos os direitos reservados.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Termos
              </Link>
              <Link
                href="/support"
                className="hover:text-foreground transition-colors"
              >
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
); }