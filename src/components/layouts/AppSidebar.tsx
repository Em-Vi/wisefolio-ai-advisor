import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Stock Analyzer',
    path: '/stock-analyzer',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 4-4 4 4 4-4 4 4" />
        <path d="M19 17V5" />
        <path d="M21 21H3" />
        <path d="M9 21v-6" />
        <path d="M15 21v-3" />
      </svg>
    ),
  },
  {
    title: 'Investor Journal',
    path: '/investor-journal',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      </svg>
    ),
  },
  {
    title: 'AI Advisor',
    path: '/ai-advisor',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M6.7 6.7a8 8 0 0 1 10.6 0M3 3a12 12 0 0 1 18 0" />
      </svg>
    ),
  },
  {
    title: 'Portfolio Simulator',
    path: '/portfolio-simulator',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 2 21 6 17 10" />
        <path d="M21 6H8a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5h8" />
        <polyline points="7 22 3 18 7 14" />
        <path d="M3 18h13a5 5 0 0 0 5-5v0a5 5 0 0 0-5-5H8" />
      </svg>
    ),
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarContent>
        <div className="py-4 px-3 flex items-center">
          <div className="w-8 h-8 rounded bg-finance-blue-700 flex items-center justify-center mr-2">
            <img src="/wisefolio.png" alt="Wisefolio Logo" className="w-6 h-6" />
          </div>
          <span className="text-lg font-semibold">Wisefolio</span>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    tooltip={item.title}
                  >
                    <Link 
                      to={item.path} 
                      className={cn({
                        'bg-finance-blue-50 text-finance-blue-700': location.pathname === item.path,
                      })}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
