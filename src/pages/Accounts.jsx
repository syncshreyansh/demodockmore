import React, { useState } from 'react';
import {
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import ProviderIcon from '../components/ui/ProviderIcon';
import ProgressBar from '../components/ui/ProgressBar';
import PillButton from '../components/ui/PillButton';
import SyncButton from '../components/ui/SyncButton';
import ConfirmModal from '../components/ui/ConfirmModal';
import ConnectAccountModal from '../components/ui/ConnectAccountModal';
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
      {/* Top Action Row */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted font-medium">
          {accounts.length} connected storage accounts
        </span>

        <PillButton
          variant="solid"
          size="sm"
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
                className="bg-surface rounded-2xl p-6 flex flex-col justify-between hover:bg-white transition-colors duration-150 relative shadow-sm"
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
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-figma bg-track/40 text-xs font-semibold">
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
                  <SyncButton
                    onSync={() => handleSync(account.id, account.name)}
                  />

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
      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        connectingProviderId={connectingProviderId}
        onProviderSelect={handleProviderSelect}
      />

      {/* Disconnect Confirmation Modal */}
      <ConfirmModal
        isOpen={disconnectModalState.isOpen}
        title="Disconnect Account"
        message={`Are you sure you want to delete/disconnect ${disconnectModalState.name}? Its files will be unindexed from your unified dashboard.`}
        confirmLabel="Disconnect"
        variant="danger"
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setDisconnectModalState({ isOpen: false, id: null, name: '' })}
      />
    </div>
  );
}
