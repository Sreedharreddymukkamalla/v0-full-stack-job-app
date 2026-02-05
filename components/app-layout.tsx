'use client';

import React, { useEffect } from "react"

import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Header } from './header';
import { loadProfileFromApi } from '@/lib/profileStore';

export function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure profile store is populated on client-side mount so reloads
    // don't lose the in-memory profile.
    loadProfileFromApi().catch(() => {});
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-secondary/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
