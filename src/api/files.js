import { mockFiles, mockFolders, mockDashboardStats } from './mockData';

let filesStore = [...mockFiles];
let foldersStore = [...mockFolders];

export async function getFiles(filters = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...filesStore];
      if (filters.folder) {
        filtered = filtered.filter((f) => f.folderId === filters.folder);
      }
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
      resolve([...foldersStore]);
    }, 50);
  });
}

export async function getDashboardStats() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...mockDashboardStats, totalFilesCount: filesStore.length });
    }, 50);
  });
}
