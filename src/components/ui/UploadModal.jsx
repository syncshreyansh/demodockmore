import React, { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle2, Cloud, Folder } from 'lucide-react';
import PillButton from './PillButton';
import ProgressBar from './ProgressBar';
import ProviderIcon from './ProviderIcon';
import { useFiles } from '../../hooks/useFiles';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../context/ToastContext';

export default function UploadModal({
  isOpen,
  defaultFolderId = null,
  onClose,
}) {
  const { addFile, folders } = useFiles();
  const { accounts } = useAccounts();
  const { showToast } = useToast();

  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState(
    accounts[0]?.email || 'mailshreyanshhere@gmail.com'
  );
  const [selectedFolderId, setSelectedFolderId] = useState(defaultFolderId || 'root');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const currentAccount =
    accounts.find((a) => a.email === selectedAccountEmail) || accounts[0];

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes >= 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleStartUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(10);

    const stepInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(stepInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(stepInterval);
      setUploadProgress(100);

      const targetFolderId = selectedFolderId === 'root' ? null : selectedFolderId;
      const targetFolder = folders.find((f) => f.id === targetFolderId);
      const targetPath = targetFolder ? `/${targetFolder.name}/` : '/';

      selectedFiles.forEach((f) => {
        addFile({
          name: f.name,
          size: formatFileSize(f.size),
          sizeBytes: f.size || 1024 * 1024 * 2,
          provider: currentAccount?.provider || 'google-drive',
          accountEmail: currentAccount?.email || 'mailshreyanshhere@gmail.com',
          path: targetPath,
          folderId: targetFolderId,
        });
      });

      setIsUploading(false);
      onClose();
      showToast(
        `Uploaded ${
          selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files`
        } to ${currentAccount?.providerName || 'Cloud'}`,
        'success'
      );
      setSelectedFiles([]);
      setUploadProgress(0);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col gap-5 relative shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">Upload Files</h3>
            <p className="text-xs text-muted mt-0.5">
              Upload local files directly to your connected cloud storages.
            </p>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-muted hover:text-ink transition-colors duration-150"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleStartUpload} className="flex flex-col gap-4">
          {/* Destination Accounts & Folders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Destination Cloud
              </label>
              <select
                disabled={isUploading}
                value={selectedAccountEmail}
                onChange={(e) => setSelectedAccountEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-track text-xs font-medium text-ink focus:outline-none cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.email}>
                    {acc.providerName} ({acc.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Destination Folder
              </label>
              <select
                disabled={isUploading}
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-track text-xs font-medium text-ink focus:outline-none cursor-pointer"
              >
                <option value="root">Root / All Files</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center gap-2.5 transition-colors duration-150 cursor-pointer ${
              isDragging
                ? 'border-ink bg-black/5'
                : 'border-track hover:border-ink/40 bg-white/70 hover:bg-white'
            }`}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-ink">
              <Upload className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">
                Drag & drop files here, or <span className="underline">browse</span>
              </p>
              <p className="text-[11px] text-muted mt-0.5">
                Supports all documents, images, video, and archives.
              </p>
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold text-muted">
                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} ready to upload
              </span>
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-track text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <File className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span className="text-ink font-medium truncate">{file.name}</span>
                    <span className="text-muted text-[10px] shrink-0">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="p-1 text-muted hover:text-ink rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar when uploading */}
          {isUploading && (
            <div className="flex flex-col gap-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-ink">Uploading to {currentAccount?.providerName}...</span>
                <span className="text-muted">{uploadProgress}%</span>
              </div>
              <ProgressBar value={uploadProgress} max={100} height="h-2" />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-track/60">
            <PillButton
              variant="ghost"
              size="sm"
              disabled={isUploading}
              onClick={onClose}
            >
              Cancel
            </PillButton>
            <PillButton
              variant="solid"
              size="sm"
              type="submit"
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}
