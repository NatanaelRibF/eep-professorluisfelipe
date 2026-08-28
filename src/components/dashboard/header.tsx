"use client";

import { Menu, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface HeaderProps {
  operatorName: string;
  operatorRole: string;
  onMenuClick: () => void;
}

export function Header({ operatorName, operatorRole, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  
  // Simple breadcrumb logic based on pathname
  const getPageName = () => {
    if (pathname === "/") return "Dashboard";
    const path = pathname.split("/")[1];
    if (!path) return "Dashboard";
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
          <span className="text-sm font-medium text-gray-900">{operatorName}</span>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {roleLabels[operatorRole] || operatorRole}
          </Badge>
        </div>
        
        <div className="relative group">
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Avatar>
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(operatorName)}
              </AvatarFallback>
            </Avatar>
          </button>
          
          <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg group-focus-within:block group-hover:block z-50">
            <div className="px-4 py-2 sm:hidden border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{operatorName}</p>
              <p className="text-xs text-gray-500">{roleLabels[operatorRole] || operatorRole}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
