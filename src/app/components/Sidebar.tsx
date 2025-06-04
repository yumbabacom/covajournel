'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useAccount, Account } from './AccountProvider';
import { useSidebar } from '../contexts/SidebarContext';
import { useAMTrader } from '../contexts/AMTraderContext';
import AddAccountModal from './AddAccountModal';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { selectedAccount, accounts, selectAccount, updateAccount, deleteAccount: deleteAccountFromContext } = useAccount();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { isAMTraderMode, toggleAMTraderMode } = useAMTrader();
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showAccountDropdown && 
          !target.closest('[data-account-dropdown-button]') && 
          dropdownRef.current && !dropdownRef.current.contains(target) &&
          !target.closest('[data-account-action-button]') &&
          !target.closest('.add-account-modal-class')
      ) {
        setShowAccountDropdown(false);
        setShowDeleteConfirm(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountDropdown]);

  // Listen for modal open/close events
  useEffect(() => {
    const handleModalOpen = () => {
      setIsModalOpen(true);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false); // Only close sidebar on mobile when modal opens
      }
    };
    const handleModalClose = () => {
      setIsModalOpen(false);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Restore sidebar on desktop when modal closes
      }
    };

    window.addEventListener('modalOpen', handleModalOpen);
    window.addEventListener('modalClose', handleModalClose);

    return () => {
      window.removeEventListener('modalOpen', handleModalOpen);
      window.removeEventListener('modalClose', handleModalClose);
    };
  }, [setSidebarOpen]);

  // If a modal is open and we're on mobile, hide the sidebar
  if (isModalOpen && window.innerWidth < 1024) {
    return null;
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    router.push('/');
  };

  const isActive = (path: string) => {
    const normalizedCurrentPath = pathname.replace(/\/$/, '').toLowerCase() || '/';
    const normalizedTargetPath = path.replace(/\/$/, '').toLowerCase();
    return normalizedCurrentPath === normalizedTargetPath;
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
    setShowAccountDropdown(false);
  };

  const handleDelete = async (accountId: string) => {
    if (selectedAccount?.id === accountId && accounts.length > 1) {
        const newSelected = accounts.find(acc => acc.id !== accountId && acc.isDefault) || accounts.find(acc => acc.id !== accountId);
        if (newSelected) {
            selectAccount(newSelected.id);
        }
    }
    await deleteAccountFromContext(accountId);
    setShowDeleteConfirm(null);
  };

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
      description: 'Admin Controls'
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
      description: 'Trading Overview'
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
      description: 'New Position'
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
      description: 'Trade History'
    },
    {
      name: 'Strategies',
      href: '/strategies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: 'indigo',
      description: 'Trading Strategies'
    },
    {
      name: 'AI Analysis',
      href: '/ai-analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: 'teal',
      description: 'AI Insights'
    },
    {
      name: 'Forex News',
      href: '/forex-news',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
      color: 'orange',
      description: 'Market News'
    },
    {
      name: 'Market Hours',
      href: '/market-hours',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'cyan',
      description: 'Trading Hours'
    },
    {
      name: 'Profit Calendar',
      href: '/profit-calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'violet',
      description: 'Daily P&L Tracking'
    }
  ];

  const colorClasses = {
    blue: {
      active: 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border-blue-200',
      hover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:text-blue-700',
      icon: 'text-blue-600',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    emerald: {
      active: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 text-emerald-700 border-emerald-200',
      hover: 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/50 hover:text-emerald-700',
      icon: 'text-emerald-600',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600'
    },
    purple: {
      active: 'bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 border-purple-200',
      hover: 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100/50 hover:text-purple-700',
      icon: 'text-purple-600',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    indigo: {
      active: 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 text-indigo-700 border-indigo-200',
      hover: 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100/50 hover:text-indigo-700',
      icon: 'text-indigo-600',
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600'
    },
    red: {
      active: 'bg-gradient-to-r from-red-50 to-red-100/50 text-red-700 border-red-200',
      hover: 'hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-700',
      icon: 'text-red-600',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    orange: {
      active: 'bg-gradient-to-r from-orange-50 to-orange-100/50 text-orange-700 border-orange-200',
      hover: 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 hover:text-orange-700',
      icon: 'text-orange-600',
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    cyan: {
      active: 'bg-gradient-to-r from-cyan-50 to-cyan-100/50 text-cyan-700 border-cyan-200',
      hover: 'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100/50 hover:text-cyan-700',
      icon: 'text-cyan-600',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600'
    },
    teal: {
      active: 'bg-gradient-to-r from-teal-50 to-teal-100/50 text-teal-700 border-teal-200',
      hover: 'hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100/50 hover:text-teal-700',
      icon: 'text-teal-600',
      iconBg: 'bg-gradient-to-br from-teal-500 to-teal-600'
    },
    violet: {
      active: 'bg-gradient-to-r from-violet-50 to-violet-100/50 text-violet-700 border-violet-200',
      hover: 'hover:bg-gradient-to-r hover:from-violet-50 hover:to-violet-100/50 hover:text-violet-700',
      icon: 'text-violet-600',
      iconBg: 'bg-gradient-to-br from-violet-500 to-violet-600'
    }
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* User Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h2>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Account Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            data-account-dropdown-button
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            className="w-full px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-between text-gray-900"
          >
            <span className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-medium text-gray-900">{selectedAccount?.name || 'Select Account'}</span>
            </span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAccountDropdown && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-2 space-y-1">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      selectAccount(account.id);
                      setShowAccountDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-md flex items-center justify-between ${
                      selectedAccount?.id === account.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${account.isDefault ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="font-medium">{account.name}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        data-account-action-button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(account);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {accounts.length > 1 && (
                        <button
                          data-account-action-button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(account.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setIsAddAccountModalOpen(true)}
                  className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center space-x-2 font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {navigationItems.map((item) => {
          const isItemActive = isActive(item.href);
          const colors = colorClasses[item.color as keyof typeof colorClasses];
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isItemActive ? colors.active : 'text-gray-600 ' + colors.hover}
                group relative
              `}
            >
              <span className={`mr-3 ${isItemActive ? colors.icon : 'text-gray-400 group-hover:text-gray-600'}`}>
                {item.icon}
              </span>
              <span>{item.name}</span>
              {isItemActive && (
                <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* AM Trader Mode Switch */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">AM Trader</span>
          </div>
          <button
            onClick={toggleAMTraderMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isAMTraderMode ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                isAMTraderMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Modals */}
      {isAddAccountModalOpen && (
        <AddAccountModal
          onClose={() => setIsAddAccountModalOpen(false)}
          onAccountCreated={() => {
            setIsAddAccountModalOpen(false);
            setShowAccountDropdown(false);
          }}
        />
      )}

      {isEditModalOpen && editingAccount && (
        <AddAccountModal
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
          }}
          onAccountCreated={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
            setShowAccountDropdown(false);
          }}
          editingAccount={editingAccount}
          isEditMode={true}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this account? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
