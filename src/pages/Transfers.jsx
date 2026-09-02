import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  Clock,
  Zap,
  Pause,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import ProviderIcon from '../components/ui/ProviderIcon';
import ProgressBar from '../components/ui/ProgressBar';
import PillButton from '../components/ui/PillButton';
import { useTransfers } from '../hooks/useTransfers';
import { useAccounts } from '../hooks/useAccounts';

export default function Transfers() {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'in_progress', 'completed'
  const [showModal, setShowModal] = useState(false);
  const { transfers, loading, addTransfer } = useTransfers(filterTab);
  const { accounts } = useAccounts();

  // New Transfer Form State
  const [formData, setFormData] = useState({
    filename: '',
    size: '120 MB',
    sourceProvider: 'google-drive',
    sourceAccount: 'mailshreyanshhere@gmail.com',
    destinationProvider: 'onedrive',
    destinationAccount: 'reachbitsandgears@outlook.com',
  });

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!formData.filename) return;

    await addTransfer({
      filename: formData.filename,
      size: formData.size,
      sourceProvider: formData.sourceProvider,
      sourceAccount: formData.sourceAccount,
      destinationProvider: formData.destinationProvider,
      destinationAccount: formData.destinationAccount,
    });

    setFormData({
      filename: '',
      size: '120 MB',
      sourceProvider: 'google-drive',
      sourceAccount: 'mailshreyanshhere@gmail.com',
      destinationProvider: 'onedrive',
      destinationAccount: 'reachbitsandgears@outlook.com',
    });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-ink">
            Transfers
          </h1>
          <p className="text-xs text-muted mt-1 font-medium">
            High-speed cloud-to-cloud direct synchronization and file migrations.
          </p>
        </div>

        <PillButton
          variant="solid"
          size="md"
          icon={Plus}
          onClick={() => setShowModal(true)}
        >
          New Transfer
        </PillButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 select-none">
        {[
          { id: 'all', label: 'All Transfers' },
          { id: 'in_progress', label: 'Active Jobs' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => {
          const isActive = filterTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors duration-150 ${
                isActive
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transfers List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="bg-surface rounded-2xl py-12 text-center text-sm text-muted">
            Loading transfers...
          </div>
        ) : transfers.length === 0 ? (
          <div className="bg-surface rounded-2xl py-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-track/40 flex items-center justify-center text-ink">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">No transfers found</p>
              <p className="text-xs text-muted mt-0.5">
                Start a high-speed cloud-to-cloud transfer to move files between your accounts.
              </p>
            </div>
            <PillButton
              variant="solid"
              size="sm"
              icon={Plus}
              onClick={() => setShowModal(true)}
              className="mt-2"
            >
              Start First Transfer
            </PillButton>
          </div>
        ) : (
          transfers.map((item) => {
            const isCompleted = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="bg-surface rounded-2xl p-5 flex flex-col gap-3 hover:bg-white transition-colors duration-150"
              >
                {/* Top Row: Providers, Direction, Filename, Size, Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Cloud Source -> Destination Badge */}
                    <div className="flex items-center gap-2 bg-track/40 px-3 py-1.5 rounded-full shrink-0">
                      <ProviderIcon provider={item.sourceProvider} size="xs" />
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                      <ProviderIcon provider={item.destinationProvider} size="xs" />
                    </div>

                    {/* File details */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-ink truncate leading-tight">
                        {item.filename}
                      </h4>
                      <p className="text-xs text-muted truncate mt-0.5 font-medium">
                        {item.sourceAccount} → {item.destinationAccount}
                      </p>
                    </div>
                  </div>

                  {/* Status & Size */}
                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    <span className="text-xs font-semibold text-ink">{item.size}</span>

                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 bg-ink text-white text-xs font-semibold px-3 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-track text-ink text-xs font-semibold px-3 py-1 rounded-full">
                        <Zap className="w-3.5 h-3.5" />
                        <span>{item.speed || 'Transferring'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Progress Bar & Meta */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {!isCompleted && (
                    <ProgressBar
                      value={item.progress}
                      max={100}
                      height="h-2"
                      className="w-full"
                    />
                  )}

                  <div className="flex items-center justify-between text-xs text-muted font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.timestamp}</span>
                    </div>

                    {!isCompleted && (
                      <div className="flex items-center gap-3 text-ink font-semibold">
                        <span>{item.progress}%</span>
                        {item.eta && <span className="text-muted font-normal">• {item.eta}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col gap-5 relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">New Cloud Transfer</h3>
                <p className="text-xs text-muted mt-0.5">
                  Transfer files between any connected cloud account directly.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-muted hover:text-ink transition-colors duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  File Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design_System_Export_2026.zip"
                  value={formData.filename}
                  onChange={(e) =>
                    setFormData({ ...formData, filename: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-track text-sm text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  File Size (Estimate)
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-track text-sm text-ink focus:outline-none focus:border-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Source Cloud
                  </label>
                  <select
                    value={formData.sourceProvider}
                    onChange={(e) => {
                      const prov = e.target.value;
                      const acc = accounts.find((a) => a.provider === prov);
                      setFormData({
                        ...formData,
                        sourceProvider: prov,
                        sourceAccount: acc ? acc.email : formData.sourceAccount,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-track text-sm text-ink focus:outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="google-drive">Google Drive</option>
                    <option value="onedrive">OneDrive</option>
                    <option value="mega">MEGA</option>
                    <option value="dropbox">Dropbox</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Destination Cloud
                  </label>
                  <select
                    value={formData.destinationProvider}
                    onChange={(e) => {
                      const prov = e.target.value;
                      const acc = accounts.find((a) => a.provider === prov);
                      setFormData({
                        ...formData,
                        destinationProvider: prov,
                        destinationAccount: acc ? acc.email : formData.destinationAccount,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-track text-sm text-ink focus:outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="onedrive">OneDrive</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="mega">MEGA</option>
                    <option value="dropbox">Dropbox</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-track/60">
                <PillButton
                  variant="ghost"
                  size="md"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </PillButton>
                <PillButton variant="solid" size="md" type="submit">
                  Start Transfer
                </PillButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
