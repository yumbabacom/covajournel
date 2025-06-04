'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AMTraderContextType {
  isAMTraderMode: boolean;
  toggleAMTraderMode: () => void;
}

const AMTraderContext = createContext<AMTraderContextType | undefined>(undefined);

export function AMTraderProvider({ children }: { children: ReactNode }) {
  const [isAMTraderMode, setIsAMTraderMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Automatically detect AM Trader mode based on current path
  useEffect(() => {
    const isOnAMTraderPage = pathname.startsWith('/am-trader');
    setIsAMTraderMode(isOnAMTraderPage);
  }, [pathname]);

  const toggleAMTraderMode = () => {
    setIsAMTraderMode(prev => {
      const newMode = !prev;
      
      // Navigate to appropriate dashboard based on the new mode
      if (newMode) {
        // Switching to AM Trader mode
        router.push('/am-trader/dashboard');
      } else {
        // Switching back to regular mode
        if (pathname.startsWith('/am-trader')) {
          router.push('/dashboard');
        }
      }
      
      return newMode;
    });
  };

  return (
    <AMTraderContext.Provider value={{ isAMTraderMode, toggleAMTraderMode }}>
      {children}
    </AMTraderContext.Provider>
  );
}

export function useAMTrader() {
  const context = useContext(AMTraderContext);
  if (context === undefined) {
    throw new Error('useAMTrader must be used within an AMTraderProvider');
  }
  return context;
} 