import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import ProviderIcon from '../components/ui/ProviderIcon';
import ProgressBar from '../components/ui/ProgressBar';
import PillButton from '../components/ui/PillButton';
import { useAccounts } from '../hooks/useAccounts';

export default function Accounts() {
  const { accounts, loading, syncAccount, disconnectAccount } = useAccounts();
  const [syncingId, setSyncingId] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleSync = async (id) => {
    setSyncingId(id);
    await syncAccount(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 400);
  };

  const handleDisconnect = async (id, name) => {
    if (confirm(`Are you sure you want to disconnect ${name}?`)) {
      await disconnectAccount(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-ink">
            Cloud Accounts
          </h1>
          <p className="text-xs text-muted mt-1 font-medium">
            Manage your connected storage providers, quota limits, and authentication status.
          </p>
        </div>

        <PillButton
          variant="solid"
          size="md"
          icon={Plus}
          onClick={() => setShowConnectModal(true)}
        >
          Connect Account
        </PillButton>
      </div>

      {/* Grid of Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-sm text-muted">
            Loading cloud accounts...
          </div>
        ) : (
          accounts.map((account) => {
            const isExpired = account.status === 'expired';
            const isSyncing = syncingId === account.id;
            const usedPercent = Math.round(
              (account.usedStorageGB / account.totalStorageGB) * 100
            );

            return (
              <div
                key={account.id}
                className="bg-surface rounded-2xl p-6 flex flex-col justify-between hover:bg-white transition-colors duration-150 relative"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <ProviderIcon
                      provider={account.provider}
                      size="lg"
                      withBackground
                    />

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-track/40 text-xs font-semibold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isExpired ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="capitalize text-ink">
                        {isExpired ? 'Auth Expired' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {/* Account Name & Email */}
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-ink truncate leading-tight">
                      {account.name}
                    </h3>
                    <p className="text-xs text-muted truncate mt-0.5 font-medium">
                      {account.email}
                    </p>
                  </div>

                  {/* Storage Progress */}
                  <div className="mt-5">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-ink">
                        {account.usedStorageGB} GB of {account.totalStorageGB} GB
                      </span>
                      <span className="text-muted">{usedPercent}%</span>
                    </div>

                    <ProgressBar
                      value={account.usedStorageGB}
                      max={account.totalStorageGB}
                      height="h-2"
                    />

                    <div className="flex items-center justify-between text-[11px] text-muted mt-2">
                      <span>{account.fileCount} indexed files</span>
                      <span>Synced {account.lastSynced}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-track/50 flex items-center justify-between gap-2">
                  <PillButton
                    variant="ghost"
                    size="xs"
                    icon={RefreshCw}
                    disabled={isSyncing}
                    onClick={() => handleSync(account.id)}
                    className={isSyncing ? 'animate-spin' : ''}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync now'}
                  </PillButton>

                  <PillButton
                    variant="danger"
                    size="xs"
                    icon={Trash2}
                    onClick={() => handleDisconnect(account.id, account.name)}
                  >
                    Disconnect
                  </PillButton>
                </div>
              </div>
            );
          })
        )}

        {/* Dashed "+ Connect New Account" Card */}
        <button
          type="button"
          onClick={() => setShowConnectModal(true)}
          className="rounded-2xl border-2 border-dashed border-track hover:border-ink/40 bg-transparent hover:bg-surface/50 p-6 flex flex-col items-center justify-center text-center gap-3 transition-colors duration-150 min-h-[260px] group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-surface group-hover:bg-white flex items-center justify-center text-ink transition-colors duration-150">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Connect New Account</h4>
            <p className="text-xs text-muted max-w-[200px] mt-1">
              Add Google Drive, Microsoft OneDrive, Dropbox, or MEGA.
            </p>
          </div>
        </button>
      </div>

      {/* Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Connect Cloud Account</h3>
                <p className="text-xs text-muted mt-0.5">
                  Select a provider to authenticate with OAuth 2.0.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-muted hover:text-ink transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                { name: 'Google Drive', id: 'google-drive', desc: 'Personal & Google Workspace' },
                { name: 'Microsoft OneDrive', id: 'onedrive', desc: 'Personal & Microsoft 365' },
                { name: 'Dropbox', id: 'dropbox', desc: 'Dropbox Personal & Business' },
                { name: 'MEGA', id: 'mega', desc: 'Encrypted Cloud Storage' },
              ].map((prov) => (
                <button
                  key={prov.id}
                  type="button"
                  onClick={() => {
                    alert(`Initiating OAuth connection flow for ${prov.name}`);
                    setShowConnectModal(false);
                  }}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-black/5 border border-track text-left transition-colors duration-150"
                >
                  <div className="flex items-center gap-3">
                    <ProviderIcon provider={prov.id} size="md" />
                    <div>
                      <p className="text-sm font-bold text-ink">{prov.name}</p>
                      <p className="text-xs text-muted">{prov.desc}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted" />
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-muted bg-track/30 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-ink shrink-0" />
              <span>
                dockMore operates in read/write proxy mode. Your credentials never touch our servers directly.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
