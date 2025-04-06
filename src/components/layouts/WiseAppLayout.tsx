
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from './AppSidebar';
import { ProfileButton } from '../auth/ProfileButton';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function WiseAppLayout() {
  const { user } = useAuth();
  
  // Generate user initials from their email or full name
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const email = user.email || '';
    const fullName = user.user_metadata?.full_name || '';
    
    if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return 'U';
  };
  
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
              <ProfileButton user={user} initials={getUserInitials()} />
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
