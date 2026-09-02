import { useState, useEffect, useCallback } from 'react';
import { getAccounts, getUserProfile, syncAccount, disconnectAccount } from '../api/accounts';

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const [accs, userData] = await Promise.all([getAccounts(), getUserProfile()]);
      setAccounts(accs);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSync = async (id) => {
    try {
      await syncAccount(id);
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === id ? { ...acc, lastSynced: 'Just now' } : acc
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisconnect = async (id) => {
    try {
      await disconnectAccount(id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    accounts,
    user,
    loading,
    error,
    refetch: fetchAccounts,
    syncAccount: handleSync,
    disconnectAccount: handleDisconnect,
  };
}
