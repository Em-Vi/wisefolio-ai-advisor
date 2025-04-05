
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function WiseAppLayout() {
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 flex items-center px-4">
          <SidebarTrigger />
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-lg font-medium ml-2">WisePortfolio</h1>
            <div className="flex items-center space-x-4">
              <button className="rounded-full w-8 h-8 bg-muted flex items-center justify-center">
                <span className="sr-only">Notifications</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </button>
              <div className="rounded-full w-8 h-8 bg-finance-blue-600 text-white flex items-center justify-center">
                <span className="font-medium text-sm">JD</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
