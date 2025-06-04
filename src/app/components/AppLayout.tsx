'use client';

import React, { useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { SidebarContext } from '@/app/contexts/SidebarContext';
import { useAMTrader } from '@/app/contexts/AMTraderContext';
import Header from './Header';
import Sidebar from './Sidebar';
import AMTraderSidebar from './AMTraderSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardMenu from './DashboardMenu';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { AMTraderProvider } from '../contexts/AMTraderContext';
import { AccountProvider } from './AccountProvider';

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const { isAMTraderMode } = useAMTrader();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setSidebarOpen]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, setSidebarOpen]);

  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isMobile && sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && sidebarOpen && isMobile) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMobile, setSidebarOpen]);

  if (!user) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-[50] w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {isAMTraderMode ? <AMTraderSidebar /> : <Sidebar />}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex-shrink-0 flex items-center justify-between p-4 bg-white border-b border-gray-200/50">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle(pathname)}
              </h1>
              <div className="w-10"></div>
            </div>
          )}

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Pages that should render without any layout (full page)
  const fullPageRoutes = ['/login', '/register', '/setup'];
  if (fullPageRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AMTraderProvider>
        <AccountProvider>
          <AppLayoutContent>{children}</AppLayoutContent>
        </AccountProvider>
      </AMTraderProvider>
    </SidebarProvider>
  );
}

// Helper function to get page titles based on pathname
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/journal': 'Trading Journal',
    '/add-trade': 'Add Trade',
    '/trading-calculator': 'Trading Calculator',
    '/calculator': 'Trading Calculator',
    '/forex-news': 'Forex News',
    '/ai-analysis': 'AI Analysis',
    '/strategy-library': 'Strategy Library',
    '/strategies': 'Strategy Library',
    '/market-hours': 'Market Hours',
    '/settings': 'Settings',
    '/admin': 'Admin Panel',
    '/profile': 'Profile',
  };

  return titles[pathname] || 'Dashboard';
}
