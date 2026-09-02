import React, { useState } from 'react';
import { X, Copy, Check, Link2, Globe, Shield } from 'lucide-react';
import PillButton from './PillButton';
import { useToast } from '../../context/ToastContext';

export default function ShareModal({ isOpen, file, onClose }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const shareUrl = `https://dockmore.app/share/f/${file.id}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch (err) {
      // Fallback
    }
    setCopied(true);
    showToast('Shareable link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 relative shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Share File</h3>
            <p className="text-xs text-muted mt-0.5">
              Anyone with this link can view this file.
            </p>
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

        <div className="p-3.5 rounded-2xl bg-white border border-track flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-track/30 flex items-center justify-center text-ink shrink-0">
            <Link2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-ink truncate">{file.name}</h4>
            <p className="text-[11px] text-muted truncate mt-0.5">{file.size} • {file.provider.replace('-', ' ')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink">Shareable Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-track text-xs text-muted font-mono select-all focus:outline-none"
            />
            <PillButton
              variant="solid"
              size="sm"
              icon={copied ? Check : Copy}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy Link'}
            </PillButton>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted bg-track/30 p-3 rounded-xl">
          <Shield className="w-4 h-4 text-ink shrink-0" />
          <span>
            Universal dockMore proxy link. Recipient does not need a cloud account to view.
          </span>
        </div>
      </div>
    </div>
  );
}
