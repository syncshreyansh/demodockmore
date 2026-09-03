import React from 'react';
import { ToastProvider } from './ToastContext';
import { AccountsProvider } from './AccountsContext';
import { FilesProvider } from './FilesContext';
import { TransfersProvider } from './TransfersContext';
import { CodeProjectsProvider } from './CodeProjectsContext';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AccountsProvider>
        <FilesProvider>
          <TransfersProvider>
            <CodeProjectsProvider>
              {children}
            </CodeProjectsProvider>
          </TransfersProvider>
        </FilesProvider>
      </AccountsProvider>
    </ToastProvider>
  );
}
