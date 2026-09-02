import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mockAccounts, mockUser } from '../api/mockData';

const AccountsContext = createContext(null);

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState(() => {
    return [...mockAccounts];
  });
  const [user, setUser] = useState(() => {
    return { ...mockUser };
  });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const syncAccount = useCallback(async (id) => {
    try {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, lastSynced: 'Just now', status: 'active' } : acc
        )
      );
      return { success: true, id, syncedAt: new Date().toISOString() };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const disconnectAccount = useCallback(async (id) => {
    try {
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
      return { success: true, id };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const connectAccount = useCallback(async (providerId) => {
    const providerMap = {
      'google-drive': {
        name: 'Google Drive',
        emailPrefix: 'shreyansh.workspace',
        domain: 'gmail.com',
        accountLabel: 'Google Drive Workspace',
        totalGB: 15,
        usedGB: 4.2,
        files: 178,
      },
      onedrive: {
        name: 'OneDrive',
        emailPrefix: 'shreyansh.personal',
        domain: 'outlook.com',
        accountLabel: 'OneDrive Personal',
        totalGB: 5,
        usedGB: 1.8,
        files: 94,
      },
      dropbox: {
        name: 'Dropbox',
        emailPrefix: 'shreyansh.design',
        domain: 'dropbox.com',
        accountLabel: 'Dropbox Work Vault',
        totalGB: 5,
        usedGB: 2.1,
        files: 132,
      },
      mega: {
        name: 'MEGA',
        emailPrefix: 'shreyansh.media',
        domain: 'mega.nz',
        accountLabel: 'MEGA Secure Archive',
        totalGB: 20,
        usedGB: 6.5,
        files: 110,
      },
    };

    const config = providerMap[providerId] || {
      name: providerId,
      emailPrefix: 'user',
      domain: 'cloud.com',
      accountLabel: `${providerId} Account`,
      totalGB: 10,
      usedGB: 2,
      files: 50,
    };

    const count = accounts.filter((a) => a.provider === providerId).length + 1;
    const newAccount = {
      id: `acc-${Date.now()}`,
      provider: providerId,
      providerName: config.name,
      name: `${config.accountLabel} #${count}`,
      email: `${config.emailPrefix}${count > 1 ? count : ''}@${config.domain}`,
      usedStorageGB: config.usedGB,
      totalStorageGB: config.totalGB,
      status: 'active',
      lastSynced: 'Just now',
      fileCount: config.files,
    };

    setAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  }, [accounts]);

  const updateUser = useCallback((updates) => {
    setUser((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const signIn = useCallback(() => {
    setIsAuthenticated(true);
    setUser({ ...mockUser });
  }, []);

  const rotateVaultKey = useCallback(() => {
    return `vault-key-${Math.random().toString(36).substring(2, 15)}`;
  }, []);

  const exportBackup = useCallback(() => {
    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user,
      accountsCount: accounts.length,
      accounts: accounts.map((a) => ({
        id: a.id,
        provider: a.provider,
        name: a.name,
        email: a.email,
        usedStorageGB: a.usedStorageGB,
        totalStorageGB: a.totalStorageGB,
      })),
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dockmore-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }, [accounts, user]);

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        user,
        isAuthenticated,
        loading,
        error,
        syncAccount,
        disconnectAccount,
        connectAccount,
        updateUser,
        signOut,
        signIn,
        rotateVaultKey,
        exportBackup,
        refetch: async () => {},
      }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccountsContext() {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccountsContext must be used within an AccountsProvider');
  }
  return context;
}


