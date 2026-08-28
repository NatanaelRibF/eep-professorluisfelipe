"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  FileText, 
  AlertTriangle, 
  UserCog, 
  School, 
  Settings, 
  FileBarChart,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { hasPermission, Role } from "@/lib/permissions";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: string;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ role, isMobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  const userRole = role as Role;

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      show: true
    },
    {
      title: "Alunos",
      href: "/alunos",
      icon: Users,
      show: true
    },
    {
      title: "Frequência",
      href: "/frequencia",
      icon: ClipboardList,
      show: true
    },
    {
      title: "RAC",
      href: "/rac",
      icon: FileText,
      show: true
    },
    {
      title: "Ocorrências",
      href: "/ocorrencias",
      icon: AlertTriangle,
      show: true
    },
    {
      title: "Operadores",
      href: "/operadores",
      icon: UserCog,
      show: hasPermission(userRole, 'manage_operators')
    },
    {
      title: "Turmas",
      href: "/turmas",
      icon: School,
      show: hasPermission(userRole, 'manage_classes')
    },
    {
      title: "Relatórios",
      href: "/relatorios",
      icon: FileBarChart,
      show: hasPermission(userRole, 'view_reports')
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
      show: hasPermission(userRole, 'manage_settings')
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 md:static",
          collapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-800 px-4">
          <GraduationCap className={cn("text-blue-500 shrink-0", collapsed ? "size-8" : "size-6 mr-3")} />
          {!collapsed && (
            <span className="font-bold text-white truncate">
              EEEP Prof. Luís Felipe
            </span>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navItems.filter(item => item.show).map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-800/50 text-white border-l-4 border-blue-500" 
                        : "hover:bg-slate-800 hover:text-white border-l-4 border-transparent"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <item.icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={() => signOut()}
            title={collapsed ? "Sair" : undefined}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="size-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-2 hidden w-full flex-col items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:flex transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </aside>
    </>
  );
}
