"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  FileText, 
  UserSearch,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export function MobileBottomNav({ onOpenMenu }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Início",
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
    },
    {
      title: "Alunos",
      href: "/alunos",
      icon: Users,
      isActive: pathname.startsWith("/alunos"),
    },
    {
      title: "Chamada",
      href: "/frequencia",
      icon: ClipboardList,
      isActive: pathname.startsWith("/frequencia"),
    },
    {
      title: "RAC",
      href: "/rac",
      icon: FileText,
      isActive: pathname.startsWith("/rac"),
    },
    {
      title: "Busca Ativa",
      href: "/busca-ativa",
      icon: UserSearch,
      isActive: pathname.startsWith("/busca-ativa"),
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 py-1.5 flex justify-around items-center print:hidden safe-area-inset-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-[11px] font-semibold min-w-[56px] min-h-[44px]",
              item.isActive
                ? "text-blue-900 font-bold bg-blue-50/80 scale-105"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Icon className={cn("h-5 w-5 mb-0.5", item.isActive ? "text-blue-800 stroke-[2.5]" : "text-slate-500")} />
            <span className="truncate max-w-[64px] text-center">{item.title}</span>
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all text-[11px] font-semibold text-slate-500 hover:text-slate-800 min-w-[56px] min-h-[44px] cursor-pointer"
      >
        <Menu className="h-5 w-5 mb-0.5 text-slate-500" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
