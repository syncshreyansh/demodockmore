import { mockTransfers } from './mockData';

/**
 * Async API layer for cloud-to-cloud file transfers.
 */

export async function getTransfers(status = 'all') {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...mockTransfers];
      if (status && status !== 'all') {
        result = result.filter((t) => t.status === status);
      }
      resolve(result);
    }, 50);
  });
}

export async function createTransfer(transferData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newTransfer = {
        id: `tr-${Date.now()}`,
        status: 'in_progress',
        progress: 5,
        speed: '12.0 MB/s',
        eta: '1m remaining',
        timestamp: 'Just now',
        ...transferData,
      };
      resolve(newTransfer);
    }, 100);
  });
}
