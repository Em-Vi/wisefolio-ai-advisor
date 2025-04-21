
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppSidebar } from './AppSidebar';
import { ProfileButton } from '../auth/ProfileButton';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';

export function WiseAppLayout() {
  const { user } = useAuth();
  
  // Generate user initials from their email or full name
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const email = user.email || '';
    const fullName = user.user_metadata?.full_name || '';
    
    if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2){
        if (nameParts[1]!=''){
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();}
      }
      
      return fullName[0].toUpperCase();
    }
    
    if (email) {
      return email[0].toUpperCase();
    }
    
    return 'U';
  };
  
  return (
    <div className="min-h-screen flex w-full overflow-x-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 flex items-center px-4">
          <SidebarTrigger className="h-9 w-9 mr-2">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-lg font-medium">Wisefolio</h1>
            <div className="flex items-center space-x-4">

              <ProfileButton user={user} initials={getUserInitials()} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
