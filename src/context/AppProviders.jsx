import React from 'react';
import { ToastProvider } from './ToastContext';
import { AccountsProvider } from './AccountsContext';
import { FilesProvider } from './FilesContext';
import { TransfersProvider } from './TransfersContext';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AccountsProvider>
        <FilesProvider>
          <TransfersProvider>
            {children}
          </TransfersProvider>
        </FilesProvider>
      </AccountsProvider>
    </ToastProvider>
  );
}

