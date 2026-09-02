import { useTransfersContext } from '../context/TransfersContext';

export function useTransfers(status = 'all') {
  const context = useTransfersContext();
  const transfers = status === 'all' 
    ? context.transfers 
    : context.transfers.filter((t) => t.status === status);

  return {
    ...context,
    transfers,
  };
}


