import { useState, useEffect, useCallback } from 'react';
import { getTransfers, createTransfer } from '../api/transfers';

export function useTransfers(status = 'all') {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTransfers(status);
      setTransfers(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const addTransfer = async (transferData) => {
    try {
      const newTransfer = await createTransfer(transferData);
      setTransfers((prev) => [newTransfer, ...prev]);
      return newTransfer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    transfers,
    loading,
    error,
    refetch: fetchTransfers,
    addTransfer,
  };
}
