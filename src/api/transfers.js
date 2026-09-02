import { mockTransfers } from './mockData';

let transfersStore = [...mockTransfers];

export async function getTransfers(status = 'all') {
  return new Promise((resolve) => {
    setTimeout(() => {
      let result = [...transfersStore];
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
        progress: 0,
        speed: '18.0 MB/s',
        eta: '10s remaining',
        timestamp: 'Just now',
        ...transferData,
      };
      transfersStore = [newTransfer, ...transfersStore];
      resolve(newTransfer);
    }, 100);
  });
}
