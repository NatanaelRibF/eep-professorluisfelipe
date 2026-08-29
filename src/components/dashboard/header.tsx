"use client";

import Link from "next/link";
import { Menu, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  operatorName: string;
  operatorRole: string;
  operatorAvatar?: string | null;
  onMenuClick: () => void;
}

export function Header({ operatorName, operatorRole, operatorAvatar, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  
  // Simple breadcrumb logic based on pathname
  const getPageName = () => {
    if (pathname === "/") return "Início";
    const path = pathname.split("/")[1];
    if (!path) return "Início";
    if (path === "perfil") return "Meu Perfil";
    if (path === "imobilizados") return "Imobilizados";
    if (path === "frequencia") return "Frequência";
    if (path === "ocorrencias") return "Ocorrências";
    if (path === "relatorios") return "Relatórios";
    if (path === "configuracoes") return "Configurações";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    coordinator: "Coordenador",
    teacher: "Professor",
    Diretor: "Diretor",
    Coordenador: "Coordenador",
    Professor: "Professor",
    Secretário: "Secretário",
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
          {getPageName()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-sm font-semibold text-gray-900">{operatorName}</span>
          <Badge variant="secondary" className="text-[10px] font-medium bg-slate-100 text-slate-700">
            {roleLabels[operatorRole] || operatorRole}
          </Badge>
        </div>
        
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Avatar className="h-10 w-10 border border-slate-200">
              {operatorAvatar && <AvatarImage src={operatorAvatar} alt={operatorName} />}
              <AvatarFallback className="bg-blue-100 text-blue-800 font-bold">
                {getInitials(operatorName)}
              </AvatarFallback>
            </Avatar>
          </button>
          
          <div className="absolute right-0 top-full mt-2 hidden w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl group-focus-within:block group-hover:block z-50 overflow-hidden">
            <div className="px-4 py-2.5 sm:hidden border-b border-gray-100 bg-slate-50">
              <p className="text-sm font-bold text-gray-900 truncate">{operatorName}</p>
              <p className="text-xs text-blue-700 font-medium">{roleLabels[operatorRole] || operatorRole}</p>
            </div>

            <Link
              href="/perfil"
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors font-medium"
            >
              <User className="h-4 w-4 text-blue-600" />
              Meu Perfil & Senha
            </Link>

            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
