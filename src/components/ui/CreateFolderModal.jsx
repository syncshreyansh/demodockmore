import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import PillButton from './PillButton';
import { useFiles } from '../../hooks/useFiles';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../context/ToastContext';

export default function CreateFolderModal({ isOpen, onClose }) {
  const { createFolder } = useFiles();
  const { accounts } = useAccounts();
  const { showToast } = useToast();

  const [folderName, setFolderName] = useState('');
  const [selectedAccountEmail, setSelectedAccountEmail] = useState(
    accounts[0]?.email || 'mailshreyanshhere@gmail.com'
  );

  if (!isOpen) return null;

  const currentAccount =
    accounts.find((a) => a.email === selectedAccountEmail) || accounts[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    createFolder({
      name: folderName.trim(),
      provider: currentAccount?.provider || 'google-drive',
      providerName: currentAccount?.providerName || 'Google Drive',
      accountEmail: currentAccount?.email || 'mailshreyanshhere@gmail.com',
    });

    showToast(`Created folder "${folderName.trim().toUpperCase()}"`, 'success');
    setFolderName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 relative shadow-2xl ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-track/30 flex items-center justify-center text-ink shrink-0">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">New Folder</h3>
              <p className="text-xs text-muted mt-0.5">Create a folder on your cloud storage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-muted hover:text-ink transition-colors duration-150"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. MARKETING ASSETS"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-track text-sm text-ink uppercase focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Cloud Storage Account
            </label>
            <select
              value={selectedAccountEmail}
              onChange={(e) => setSelectedAccountEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-track text-xs font-medium text-ink focus:outline-none cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.email}>
                  {acc.providerName} ({acc.name} - {acc.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-track/60">
            <PillButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </PillButton>
            <PillButton variant="solid" size="sm" type="submit">
              Create Folder
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}




