'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount, Account } from './AccountProvider';
import AddAccountModal from './AddAccountModal';

const ACCOUNT_TAGS = {
  'funded': { label: 'Funded', color: 'bg-emerald-100 text-emerald-800', icon: '💰' },
  'personal': { label: 'Personal', color: 'bg-blue-100 text-blue-800', icon: '👤' },
  'demo': { label: 'Demo', color: 'bg-gray-100 text-gray-800', icon: '🧪' },
  'prop': { label: 'Prop Firm', color: 'bg-purple-100 text-purple-800', icon: '🏢' },
  'challenge': { label: 'Challenge', color: 'bg-orange-100 text-orange-800', icon: '🎯' },
  'live': { label: 'Live', color: 'bg-red-100 text-red-800', icon: '🚀' },
  'backup': { label: 'Backup', color: 'bg-yellow-100 text-yellow-800', icon: '🔄' },
};

export default function AccountSelector() {
  const { accounts, selectedAccount, selectAccount, isLoading, deleteAccount } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsRenaming(false);
        setShowDeleteConfirm(null);
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

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsEditModalOpen(true);
    setIsOpen(false);
  };

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccount(accountId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account');
    }
  };

  const getAccountTag = (account: Account) => {
    const tag = account.tag || 'personal';
    return ACCOUNT_TAGS[tag as keyof typeof ACCOUNT_TAGS] || ACCOUNT_TAGS.personal;
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

  const selectedAccountTag = getAccountTag(selectedAccount);

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg">{selectedAccountTag.icon}</span>
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {selectedAccount.name}
              </p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedAccountTag.color}`}>
                {selectedAccountTag.label}
              </span>
            </div>
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
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl z-50 min-w-80 overflow-hidden">
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
                      <span className="text-sm">{selectedAccountTag.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedAccount.name}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedAccountTag.color}`}>
                          {selectedAccountTag.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Current Account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(selectedAccount)}
                      className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg border-2 border-blue-700 flex items-center font-semibold"
                      title="Edit account"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-sm">EDIT</span>
                    </button>
                    <button
                      onClick={startRenaming}
                      className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 transition-colors rounded-lg border-2 border-green-700 flex items-center font-semibold"
                      title="Rename account"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="text-sm">RENAME</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account List */}
            <div className="max-h-80 overflow-y-auto">
              {accounts.map((account) => {
                const accountTag = getAccountTag(account);
                const isSelected = selectedAccount.id === account.id;
                
                return (
                  <div
                    key={account.id}
                    className={`relative group ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    } transition-all duration-200`}
                  >
                    {showDeleteConfirm === account.id ? (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20">
                        <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                          Delete "{account.name}"? This action cannot be undone.
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center bg-yellow-300">
                        <button
                          onClick={() => {
                            selectAccount(account.id);
                            setIsOpen(false);
                          }}
                          className="flex-1 p-3 flex items-center space-x-3 text-left"
                        >
                          <div className={`w-8 h-8 bg-gradient-to-br ${
                            account.isDefault ? 'from-emerald-500 to-teal-500' : 'from-gray-400 to-gray-500'
                          } rounded-lg flex items-center justify-center`}>
                            <span className="text-sm">{accountTag.icon}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {account.name}
                              </p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${accountTag.color}`}>
                                {accountTag.label}
                              </span>
                              {account.isDefault && (
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${account.currentBalance.toLocaleString()}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                        
                        {/* Account Actions */}
                        <div className="flex items-center space-x-1 pr-3 transition-opacity duration-300 bg-red-500 border-2 border-black opacity-100">
                          <span className="bg-green-500 p-1">ICON TEST</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(account);
                            }}
                            className="p-1.5 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit account"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {!account.isDefault && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(account.id);
                              }}
                              className="p-1.5 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete account"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Account Button */}
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setIsOpen(false);
                }}
                className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add New Account</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create a new trading account</p>
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
            // Account list will refresh automatically via context
          }}
        />
      )}

      {/* Edit Account Modal */}
      {isEditModalOpen && (
        <AddAccountModal
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
          }}
          onAccountCreated={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
            // Account list will refresh automatically via context
          }}
          editingAccount={editingAccount}
          isEditMode={true}
        />
      )}
    </>
  );
}
