import { mockAccounts, mockUser } from './mockData';

let accountsStore = [...mockAccounts];
let userStore = { ...mockUser };

export async function getAccounts() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...accountsStore]);
    }, 50);
  });
}

export async function getAccountById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const account = accountsStore.find((a) => a.id === id);
      if (account) {
        resolve({ ...account });
      } else {
        reject(new Error(`Account with id ${id} not found`));
      }
    }, 50);
  });
}

export async function getUserProfile() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...userStore });
    }, 50);
  });
}

export async function syncAccount(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      accountsStore = accountsStore.map((acc) =>
        acc.id === id ? { ...acc, lastSynced: 'Just now', status: 'active' } : acc
      );
      resolve({ success: true, id, syncedAt: new Date().toISOString() });
    }, 100);
  });
}

export async function disconnectAccount(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      accountsStore = accountsStore.filter((acc) => acc.id !== id);
      resolve({ success: true, id });
    }, 100);
  });
}


