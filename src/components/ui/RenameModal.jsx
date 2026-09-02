import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import PillButton from './PillButton';

export default function RenameModal({
  isOpen,
  initialName = '',
  title = 'Rename Item',
  onRename,
  onClose,
}) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRename(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 relative shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-track/30 flex items-center justify-center text-ink shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-ink">{title}</h3>
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
              New Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-track text-sm text-ink focus:outline-none focus:border-ink"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-track/60">
            <PillButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </PillButton>
            <PillButton variant="solid" size="sm" type="submit">
              Save
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}
