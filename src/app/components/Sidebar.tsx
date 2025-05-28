'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import AccountSelector from './AccountSelector';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsCollapsed(window.innerWidth < 1024);
      }
    };

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationItems = user.isAdmin ? [
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'red',
    }
  ] : [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      color: 'blue',
    },
    {
      name: 'Add Trade',
      href: '/add-trade',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'emerald',
    },
    {
      name: 'Journal',
      href: '/journal',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'purple',
    }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-700 shadow-2xl z-50 transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  TradingJournal
                </h1>
                <p className="text-xs text-emerald-400 font-medium">Professional Platform</p>
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2 flex-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          const colorClasses = {
            blue: {
              active: 'bg-blue-600 text-white',
              hover: 'hover:bg-slate-800 hover:text-blue-400',
              icon: 'text-blue-400'
            },
            emerald: {
              active: 'bg-emerald-600 text-white',
              hover: 'hover:bg-slate-800 hover:text-emerald-400',
              icon: 'text-emerald-400'
            },
            purple: {
              active: 'bg-purple-600 text-white',
              hover: 'hover:bg-slate-800 hover:text-purple-400',
              icon: 'text-purple-400'
            },
            red: {
              active: 'bg-red-600 text-white',
              hover: 'hover:bg-slate-800 hover:text-red-400',
              icon: 'text-red-400'
            }
          };

          const colors = colorClasses[item.color as keyof typeof colorClasses];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? colors.active
                  : `text-slate-300 ${colors.hover}`
              } ${!isCollapsed ? 'space-x-3' : 'justify-center'}`}
            >
              <div className={`flex-shrink-0 ${active ? 'text-white' : colors.icon}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Account Selector - Only for regular users */}
      {!user.isAdmin && !isCollapsed && (
        <div className="p-4 border-t border-slate-700">
          <AccountSelector />
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-xl border border-slate-600">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                user.isAdmin
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }`}>
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  {user.isAdmin && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-lg">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Collapsed User Avatar */}
            <div className="flex justify-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                user.isAdmin
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              }`}>
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Collapsed Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
