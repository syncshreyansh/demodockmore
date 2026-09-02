import { mockFiles, mockFolders, mockDashboardStats } from './mockData';

/**
 * Async API layer for files and storage statistics.
 */

export async function getFiles(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockFiles];
      if (filters.provider && filters.provider !== 'all') {
        filtered = filtered.filter((f) => f.provider === filters.provider);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.accountEmail.toLowerCase().includes(q) ||
            f.path.toLowerCase().includes(q)
        );
      }
      resolve(filtered);
    }, 50);
  });
}

export async function getRecentFolders() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockFolders]);
    }, 50);
  });
}

export async function getDashboardStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...mockDashboardStats });
    }, 50);
  });
}
