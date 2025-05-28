'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from './AccountProvider';
import AddAccountModal from './AddAccountModal';

export default function AccountSelector() {
  const { accounts, selectedAccount, selectAccount, isLoading } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsRenaming(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = async () => {
    if (!selectedAccount || !newName.trim()) return;

    try {
      const { updateAccount } = useAccount();
      await updateAccount(selectedAccount.id, { name: newName.trim() });
      setIsRenaming(false);
      setNewName('');
    } catch (error) {
      console.error('Failed to rename account:', error);
      alert('Failed to rename account');
    }
  };

  const startRenaming = () => {
    if (selectedAccount) {
      setNewName(selectedAccount.name);
      setIsRenaming(true);
    }
  };

  if (isLoading || !selectedAccount) {
    return (
      <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
        <div>
          <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
          <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {selectedAccount.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ${selectedAccount.currentBalance.toLocaleString()}
            </p>
          </div>
          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl z-50 min-w-64 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Trading Accounts</h3>

              {/* Current Account with Rename Option */}
              {isRenaming ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    placeholder="Account name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') {
                        setIsRenaming(false);
                        setNewName('');
                      }
                    }}
                  />
                  <button
                    onClick={handleRename}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(false);
                      setNewName('');
                    }}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedAccount.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Current Account
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={startRenaming}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Rename account"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Account List */}
            <div className="max-h-64 overflow-y-auto">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => {
                    selectAccount(account.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                    selectedAccount.id === account.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${
                    account.isDefault ? 'from-emerald-500 to-teal-500' : 'from-gray-400 to-gray-500'
                  } rounded-lg flex items-center justify-center`}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {account.name}
                      </p>
                      {account.isDefault && (
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${account.currentBalance.toLocaleString()}
                    </p>
                  </div>
                  {selectedAccount.id === account.id && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}

              {/* Add Account Button */}
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full p-3 flex items-center space-x-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Add New Account
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Create a new trading account
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <AddAccountModal
          onClose={() => setIsAddModalOpen(false)}
          onAccountCreated={() => {
            setIsAddModalOpen(false);
          }}
        />
      )}
    </>
  );
}
