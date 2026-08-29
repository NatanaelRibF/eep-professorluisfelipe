"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function DashboardShell({ children, user }: DashboardShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const displayName = user.nickname || user.name || 'Usuário';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar 
        role={user.role || 'teacher'} 
        isMobileOpen={isMobileOpen}
        setMobileOpen={setIsMobileOpen}
      />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          operatorName={displayName}
          operatorRole={user.role || 'teacher'}
          operatorAvatar={user.image}
          onMenuClick={() => setIsMobileOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
