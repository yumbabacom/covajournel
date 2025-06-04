'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, Account } from './AccountProvider';

interface AddAccountModalProps {
  onClose: () => void;
  onAccountCreated: () => void;
  editingAccount?: Account | null;
  isEditMode?: boolean;
}

const ACCOUNT_TAGS = [
  { id: 'funded', label: 'Funded', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '💰' },
  { id: 'personal', label: 'Personal', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '👤' },
  { id: 'demo', label: 'Demo', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🧪' },
  { id: 'prop', label: 'Prop Firm', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🏢' },
  { id: 'challenge', label: 'Challenge', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🎯' },
  { id: 'live', label: 'Live', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚀' },
  { id: 'backup', label: 'Backup', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🔄' },
];

export default function AddAccountModal({ onClose, onAccountCreated, editingAccount, isEditMode = false }: AddAccountModalProps) {
  const { createAccount, updateAccount } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
    tag: 'personal',
    customTag: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isEditMode && editingAccount) {
      setFormData({
        name: editingAccount.name,
        initialBalance: editingAccount.currentBalance.toString(),
        tag: (editingAccount as any).tag || 'personal',
        customTag: '',
      });
    }
    return () => setMounted(false);
  }, [isEditMode, editingAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.name.trim()) {
        throw new Error('Account name is required');
      }

      const balance = parseFloat(formData.initialBalance);
      if (isNaN(balance) || balance < 0) {
        throw new Error('Balance must be a valid positive number');
      }

      const accountData = {
        name: formData.name.trim(),
        tag: formData.customTag.trim() || formData.tag,
      };

      if (isEditMode && editingAccount) {
        await updateAccount(editingAccount.id, {
          ...accountData,
          currentBalance: balance,
        });
      } else {
        await createAccount(formData.name.trim(), balance, formData.customTag.trim() || formData.tag);
      }
      
      onAccountCreated();
    } catch (error: any) {
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} account`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isEditMode ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    )}
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {isEditMode ? 'Edit Account' : 'Create New Account'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {isEditMode ? 'Update your trading account details' : 'Set up a new trading account to track your trades'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Account Name */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <svg className="w-4 h-4 inline mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg font-medium shadow-sm"
                    placeholder="e.g., Main Trading Account"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Balance */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <svg className="w-4 h-4 inline mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {isEditMode ? 'Current Balance' : 'Initial Balance'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-green-600 text-xl font-bold">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData(prev => ({ ...prev, initialBalance: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-lg font-medium shadow-sm"
                      placeholder="10,000.00"
                      required
                      disabled={isLoading}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-xs text-gray-400 font-medium">USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Account Tags */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <svg className="w-4 h-4 inline mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {ACCOUNT_TAGS.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tag: tag.id, customTag: '' }))}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          formData.tag === tag.id && !formData.customTag
                            ? `${tag.color} border-opacity-100 shadow-lg` 
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{tag.icon}</span>
                          <span className="text-sm font-medium">{tag.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Tag */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                    <svg className="w-4 h-4 inline mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Custom Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, customTag: e.target.value, tag: '' }))}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium shadow-sm"
                    placeholder="e.g., FTMO, MyForexFunds..."
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to use selected type above
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-200 font-semibold text-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white rounded-2xl transition-all duration-200 font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>{isEditMode ? 'Updating...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isEditMode ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      )}
                    </svg>
                    <span>{isEditMode ? 'Update Account' : 'Create Account'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
