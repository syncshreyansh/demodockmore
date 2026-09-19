import React from 'react';
import { ToastProvider } from './ToastContext';
import { AuthProvider } from './AuthContext';
import { AccountsProvider } from './AccountsContext';
import { FilesProvider } from './FilesContext';
import { TransfersProvider } from './TransfersContext';
import { CodeProjectsProvider } from './CodeProjectsContext';

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AccountsProvider>
          <FilesProvider>
            <TransfersProvider>
              <CodeProjectsProvider>
                {children}
              </CodeProjectsProvider>
            </TransfersProvider>
          </FilesProvider>
        </AccountsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
