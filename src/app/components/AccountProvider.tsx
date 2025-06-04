'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthProvider';

export interface Account {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  isDefault: boolean;
  tag?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  selectAccount: (accountId: string) => void;
  createAccount: (name: string, initialBalance: number, tag?: string) => Promise<Account>;
  updateAccount: (accountId: string, updates: Partial<Account>) => Promise<Account>;
  deleteAccount: (accountId: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  updateAccountBalance: (accountId: string, newBalance: number) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

interface AccountProviderProps {
  children: ReactNode;
}

export function AccountProvider({ children }: AccountProviderProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  // Fetch accounts when user changes
  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setSelectedAccount(null);
    }
  }, [user]);

  // Auto-select first account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      // Try to restore previously selected account from localStorage
      const savedAccountId = localStorage.getItem('selectedAccountId');
      if (savedAccountId) {
        const savedAccount = accounts.find(acc => acc.id === savedAccountId);
        if (savedAccount) {
          setSelectedAccount(savedAccount);
          return;
        }
      }
      
      // If no saved account or saved account not found, select first account
      const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
      setSelectedAccount(defaultAccount);
      localStorage.setItem('selectedAccountId', defaultAccount.id);
    }
  }, [accounts, selectedAccount]);

  // ✅ ADD EVENT LISTENERS FOR TRADE DELETION AND ACCOUNT BALANCE UPDATES
  useEffect(() => {
    const handleAccountBalanceRecalculate = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('💰 AccountProvider: Account balance recalculate event received', customEvent.detail);
      try {
        if (customEvent.detail.accountId && selectedAccount?.id === customEvent.detail.accountId) {
          console.log('💰 Refreshing account data due to trade deletion');
          await refreshAccounts();
        }
      } catch (error) {
        console.error('Failed to refresh accounts after trade deletion:', error);
      }
    };

    const handleTradeDeleted = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('💰 AccountProvider: Trade deleted event received', customEvent.detail);
      try {
        // Refresh all accounts to ensure balance consistency
        await refreshAccounts();
      } catch (error) {
        console.error('Failed to refresh accounts after trade deletion:', error);
      }
    };

    const handleForceRefresh = async (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('💰 AccountProvider: Force refresh event received', customEvent.detail);
      if (customEvent.detail.action === 'tradeDeleted') {
        try {
          await refreshAccounts();
        } catch (error) {
          console.error('Failed to refresh accounts during force refresh:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('accountBalanceRecalculate', handleAccountBalanceRecalculate);
    window.addEventListener('tradeDeleted', handleTradeDeleted);
    window.addEventListener('forceRefresh', handleForceRefresh);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('accountBalanceRecalculate', handleAccountBalanceRecalculate);
      window.removeEventListener('tradeDeleted', handleTradeDeleted);
      window.removeEventListener('forceRefresh', handleForceRefresh);
    };
  }, [selectedAccount]);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (process.env.NODE_ENV === 'development') {
          console.log('No token found, user not authenticated');
        }
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // If no accounts exist, create a default one
        if (data.accounts.length === 0) {
          await createDefaultAccount();
          return; // fetchAccounts will be called again after creating default account
        }

        setAccounts(data.accounts);
      } else if (response.status === 401) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Token expired or invalid, user needs to login again');
        }
        // Don't show error for authentication issues
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch accounts');
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching accounts:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, cannot create default account');
        return;
      }

      const response = await fetch('/api/accounts/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Fetch accounts again after creating default account
        await fetchAccounts();
      } else if (response.status === 401) {
        console.log('Token expired or invalid, cannot create default account');
      }
    } catch (error) {
      console.error('Error creating default account:', error);
    }
  };

  const selectAccount = (accountId: string) => {
    console.log('Selecting account:', accountId);
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      console.log('Account found:', account);
      setSelectedAccount(account);
      // Store selected account in localStorage for persistence
      localStorage.setItem('selectedAccountId', accountId);
    } else {
      console.log('Account not found for ID:', accountId);
    }
  };

  const createAccount = async (name: string, initialBalance: number, tag?: string): Promise<Account> => {
    if (!user) throw new Error('User not authenticated');

    const token = localStorage.getItem('token');
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, initialBalance, tag }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create account');
    }

    const data = await response.json();
    const newAccount = data.account;

    setAccounts(prev => [...prev, newAccount]);

    // If this is the first account, select it
    if (accounts.length === 0) {
      setSelectedAccount(newAccount);
    }

    return newAccount;
  };

  const updateAccount = async (accountId: string, updates: Partial<Account>): Promise<Account> => {
    if (!user) throw new Error('User not authenticated');

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/accounts/${accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update account');
    }

    const data = await response.json();
    const updatedAccount = data.account;

    setAccounts(prev => prev.map(acc =>
      acc.id === accountId ? updatedAccount : acc
    ));

    // Update selected account if it's the one being updated
    if (selectedAccount?.id === accountId) {
      setSelectedAccount(updatedAccount);
    }

    return updatedAccount;
  };

  const deleteAccount = async (accountId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    const token = localStorage.getItem('token');
    const response = await fetch(`/api/accounts/${accountId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }

    setAccounts(prev => prev.filter(acc => acc.id !== accountId));

    // If deleted account was selected, select another one
    if (selectedAccount?.id === accountId) {
      const remainingAccounts = accounts.filter(acc => acc.id !== accountId);
      setSelectedAccount(remainingAccounts.length > 0 ? remainingAccounts[0] : null);
    }
  };

  const refreshAccounts = async () => {
    await fetchAccounts();
  };

  const updateAccountBalance = async (accountId: string, newBalance: number): Promise<void> => {
    await updateAccount(accountId, { currentBalance: newBalance });
  };

  const value = {
    accounts,
    selectedAccount,
    isLoading,
    selectAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
    updateAccountBalance,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}
