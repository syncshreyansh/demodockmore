import { mockAccounts, mockUser } from './mockData';

/**
 * Async API layer for accounts.
 * Returns Promises simulating network calls so calling code will not need to change
 * when swapped with real REST/GraphQL APIs.
 */

export async function getAccounts() {
  return new Promise((resolve) => {
    // Simulating async network delay
    setTimeout(() => {
      resolve([...mockAccounts]);
    }, 50);
  });
}

export async function getAccountById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const account = mockAccounts.find((a) => a.id === id);
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
      resolve({ ...mockUser });
    }, 50);
  });
}

export async function syncAccount(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id, syncedAt: new Date().toISOString() });
    }, 100);
  });
}

export async function disconnectAccount(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, id });
    }, 100);
  });
}
