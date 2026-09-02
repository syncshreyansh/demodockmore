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
  Loader2,
} from 'lucide-react';
import ProviderIcon from '../components/ui/ProviderIcon';
import ProgressBar from '../components/ui/ProgressBar';
import PillButton from '../components/ui/PillButton';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useAccounts } from '../hooks/useAccounts';
import { useToast } from '../context/ToastContext';

export default function Accounts() {
  const { accounts, loading, syncAccount, disconnectAccount, connectAccount } = useAccounts();
  const { showToast } = useToast();

  const [syncingId, setSyncingId] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingProviderId, setConnectingProviderId] = useState(null);
  const [disconnectModalState, setDisconnectModalState] = useState({
    isOpen: false,
    id: null,
    name: '',
  });

  const handleSync = async (id, name) => {
    setSyncingId(id);
    await syncAccount(id);
    setTimeout(() => {
      setSyncingId(null);
      showToast(`Synced ${name} successfully`, 'success');
    }, 400);
  };

  const handleOpenDisconnect = (id, name) => {
    setDisconnectModalState({
      isOpen: true,
      id,
      name,
    });
  };

  const handleConfirmDisconnect = async () => {
    if (disconnectModalState.id) {
      await disconnectAccount(disconnectModalState.id);
      showToast(`Disconnected ${disconnectModalState.name}`, 'info');
    }
    setDisconnectModalState({ isOpen: false, id: null, name: '' });
  };

  const handleProviderSelect = async (prov) => {
    setConnectingProviderId(prov.id);

    setTimeout(async () => {
      await connectAccount(prov.id);
      setConnectingProviderId(null);
      setShowConnectModal(false);
      showToast(`Successfully connected ${prov.name} account`, 'success');
    }, 1000);
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
              (account.usedStorageGB / (account.totalStorageGB || 1)) * 100
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
                    onClick={() => handleSync(account.id, account.name)}
                    className={isSyncing ? 'animate-spin' : ''}
                  >
                    {isSyncing ? 'Syncing...' : 'Sync now'}
                  </PillButton>

                  <PillButton
                    variant="danger"
                    size="xs"
                    icon={Trash2}
                    onClick={() => handleOpenDisconnect(account.id, account.name)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 relative shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Connect Cloud Account</h3>
                <p className="text-xs text-muted mt-0.5">
                  Select a provider to authenticate with OAuth 2.0.
                </p>
              </div>
              <button
                type="button"
                disabled={Boolean(connectingProviderId)}
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
              ].map((prov) => {
                const isConnecting = connectingProviderId === prov.id;

                return (
                  <button
                    key={prov.id}
                    type="button"
                    disabled={Boolean(connectingProviderId)}
                    onClick={() => handleProviderSelect(prov)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-colors duration-150 ${
                      isConnecting
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white hover:bg-black/5 border-track'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ProviderIcon provider={prov.id} size="md" />
                      <div>
                        <p className={`text-sm font-bold ${isConnecting ? 'text-white' : 'text-ink'}`}>
                          {prov.name}
                        </p>
                        <p className={`text-xs ${isConnecting ? 'text-white/80' : 'text-muted'}`}>
                          {isConnecting ? 'Authenticating via OAuth 2.0...' : prov.desc}
                        </p>
                      </div>
                    </div>
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-muted" />
                    )}
                  </button>
                );
              })}
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

      {/* Disconnect Confirmation Modal */}
      <ConfirmModal
        isOpen={disconnectModalState.isOpen}
        title="Disconnect Account"
        message={`Are you sure you want to disconnect ${disconnectModalState.name}? Its files will be unindexed from your unified dashboard.`}
        confirmLabel="Disconnect"
        variant="danger"
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setDisconnectModalState({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
}
