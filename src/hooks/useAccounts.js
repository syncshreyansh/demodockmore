import { useAccountsContext } from '../context/AccountsContext';

export function useAccounts() {
  return useAccountsContext();
}
