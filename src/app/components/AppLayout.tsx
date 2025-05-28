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
        <div className="flex min-h-screen">
          <Sidebar />
          <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
              <Header />
            </div>
            <main className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0">
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
