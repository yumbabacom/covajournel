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
  createdAt: string;
  updatedAt: string;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  selectAccount: (accountId: string) => void;
  createAccount: (name: string, initialBalance: number) => Promise<Account>;
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

  // Fetch accounts when user changes
  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setSelectedAccount(null);
    }
  }, [user]);

  // Auto-select default account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const defaultAccount = accounts.find(acc => acc.isDefault) || accounts[0];
      setSelectedAccount(defaultAccount);
    }
  }, [accounts, selectedAccount]);

  const fetchAccounts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
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
      } else {
        console.error('Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accounts/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Fetch accounts again after creating default account
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error creating default account:', error);
    }
  };

  const selectAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setSelectedAccount(account);
      // Store selected account in localStorage for persistence
      localStorage.setItem('selectedAccountId', accountId);
    }
  };

  const createAccount = async (name: string, initialBalance: number): Promise<Account> => {
    if (!user) throw new Error('User not authenticated');

    const token = localStorage.getItem('token');
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, initialBalance }),
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
