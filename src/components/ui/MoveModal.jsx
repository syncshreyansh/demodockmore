import React, { useState } from 'react';
import { X, Folder, FolderInput, HardDrive } from 'lucide-react';
import PillButton from './PillButton';
import { useFiles } from '../../hooks/useFiles';
import ProviderIcon from './ProviderIcon';

export default function MoveModal({
  isOpen,
  fileCount = 1,
  currentFolderId = null,
  onMove,
  onClose,
}) {
  const { folders } = useFiles();
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId || 'root');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const targetFolderId = selectedFolderId === 'root' ? null : selectedFolderId;
    const targetFolder = folders.find((f) => f.id === targetFolderId);
    const newPath = targetFolder ? `/${targetFolder.name}/` : '/';
    onMove(targetFolderId, newPath);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-5 relative shadow-2xl ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-track/30 flex items-center justify-center text-ink shrink-0">
              <FolderInput className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink">Move {fileCount > 1 ? `${fileCount} Items` : 'Item'}</h3>
              <p className="text-xs text-muted mt-0.5">Select a destination folder</p>
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
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {/* Root Option */}
            <button
              type="button"
              onClick={() => setSelectedFolderId('root')}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors duration-150 ${
                selectedFolderId === 'root'
                  ? 'bg-ink text-white border-ink'
                  : 'bg-white text-ink border-track hover:bg-black/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HardDrive className={`w-4 h-4 ${selectedFolderId === 'root' ? 'text-white' : 'text-ink'}`} />
                <span className="text-xs font-semibold">Root / All Files</span>
              </div>
            </button>

            {/* Folders */}
            {folders.map((folder) => {
              const isSelected = selectedFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors duration-150 ${
                    isSelected
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-ink border-track hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-ink'}`} />
                    <span className="text-xs font-semibold truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <ProviderIcon provider={folder.provider} size="xs" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-track/60">
            <PillButton variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </PillButton>
            <PillButton variant="solid" size="sm" type="submit">
              Move Here
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}




