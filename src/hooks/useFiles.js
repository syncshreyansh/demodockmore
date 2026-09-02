import { useState, useEffect, useCallback } from 'react';
import { getFiles, getRecentFolders, getDashboardStats } from '../api/files';

export function useFiles(filters = {}) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [filesData, foldersData, statsData] = await Promise.all([
        getFiles(filters),
        getRecentFolders(),
        getDashboardStats(),
      ]);
      setFiles(filesData);
      setFolders(foldersData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    files,
    folders,
    stats,
    loading,
    error,
    refetch: fetchData,
  };
}
