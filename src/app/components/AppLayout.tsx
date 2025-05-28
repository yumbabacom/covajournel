'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import Header from './Header';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {user ? (
        // Logged-in layout with sidebar
        <div className="flex">
          <Sidebar />
          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'} lg:${sidebarCollapsed ? 'ml-20' : 'ml-72'} md:ml-20 sm:ml-20`}>
            <div className="sticky top-0 z-40">
              <Header />
            </div>
            <main className="p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      ) : (
        // Guest layout with full header
        <div>
          <Header />
          <main>
            {children}
          </main>
        </div>
      )}
    </div>
  );
}
