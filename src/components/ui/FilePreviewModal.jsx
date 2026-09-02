import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Share2,
  Edit3,
  FolderInput,
  Trash2,
  Star,
  FileText,
  FileCode,
  FileArchive,
  Film,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  HardDrive,
  Clock,
  ExternalLink,
} from 'lucide-react';
import SlideUpModal from './SlideUpModal';
import ProviderIcon from './ProviderIcon';
import PillButton from './PillButton';
import ShareModal from './ShareModal';
import RenameModal from './RenameModal';
import MoveModal from './MoveModal';
import ConfirmModal from './ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { useFiles } from '../../hooks/useFiles';

const getFileIcon = (extension) => {
  const ext = (extension || '').toLowerCase();
  switch (ext) {
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
      return FileText;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheet;
    case 'zip':
    case 'tar':
    case 'tar.gz':
    case 'rar':
    case '7z':
      return FileArchive;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return Film;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
    case 'webp':
      return ImageIcon;
    case 'fig':
    case 'sketch':
    case 'ai':
    case 'psd':
      return FileCode;
    default:
      return File;
  }
};

export default function FilePreviewModal({ isOpen, file, onClose }) {
  const { showToast } = useToast();
  const { deleteFile, renameFile, moveFile, toggleStar } = useFiles();

  const [showShare, setShowShare] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const lastFileRef = useRef(file);
  if (file) {
    lastFileRef.current = file;
  }
  const currentFile = file || lastFileRef.current;

  if (!currentFile) return null;

  const FileTypeIcon = getFileIcon(currentFile.extension);

  const handleDownload = () => {
    showToast(`Downloading ${currentFile.name}...`, 'success');
  };

  const handleToggleStar = () => {
    toggleStar(currentFile.id);
    showToast(currentFile.starred ? 'Removed from Starred' : 'Added to Starred', 'info');
  };

  const handleRename = (newName) => {
    renameFile(currentFile.id, newName);
    showToast(`Renamed file to "${newName}"`, 'success');
  };

  const handleMove = (newFolderId, newPath) => {
    moveFile(currentFile.id, newFolderId, newPath);
    showToast(`Moved ${currentFile.name} to ${newPath}`, 'success');
  };

  const handleDelete = () => {
    deleteFile(currentFile.id);
    setShowDeleteConfirm(false);
    onClose();
    showToast(`Deleted ${currentFile.name}`, 'info');
  };

  return (
    <>
      <SlideUpModal
        isOpen={isOpen}
        onClose={onClose}
        panelClassName="bg-surface rounded-3xl p-6 sm:p-8 max-w-lg w-full flex flex-col gap-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-muted font-sans">
              File Details
            </span>
            <button
              type="button"
              onClick={handleToggleStar}
              className="p-1 rounded-full text-muted hover:text-amber-500 transition-colors"
              title={currentFile.starred ? 'Unstar' : 'Star'}
            >
              <Star
                className={`w-4 h-4 ${
                  currentFile.starred ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="group p-1.5 rounded-full hover:bg-black/5 text-muted hover:text-ink transition-colors duration-150 shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {/* Thumbnail / Hero Box */}
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center gap-3 shadow-sm text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-track/40 flex items-center justify-center text-ink">
            <FileTypeIcon className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="max-w-full">
            <h3 className="text-base font-bold text-ink truncate px-2">{currentFile.name}</h3>
            <p className="text-xs text-muted mt-0.5">{currentFile.size} • {(currentFile.extension || 'file').toUpperCase()}</p>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl shadow-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-muted">Cloud Provider</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ProviderIcon provider={currentFile.provider} size="xs" />
              <span className="text-xs font-semibold text-ink capitalize">
                {currentFile.provider.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-muted">Account</span>
            <span className="text-xs font-medium text-ink truncate">
              {currentFile.accountEmail}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-muted">Path / Location</span>
            <span className="text-xs font-medium text-ink truncate">
              {currentFile.path || '/'}
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-muted">Last Modified</span>
            <span className="text-xs font-medium text-ink">
              {currentFile.modified}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <PillButton
            variant="solid"
            size="sm"
            icon={Download}
            onClick={handleDownload}
            className="w-full"
          >
            Download
          </PillButton>

          <PillButton
            variant="ghost"
            size="sm"
            icon={Share2}
            onClick={() => setShowShare(true)}
            className="w-full"
          >
            Share
          </PillButton>

          <PillButton
            variant="ghost"
            size="sm"
            icon={Edit3}
            onClick={() => setShowRename(true)}
            className="w-full"
          >
            Rename
          </PillButton>

          <PillButton
            variant="ghost"
            size="sm"
            icon={FolderInput}
            onClick={() => setShowMove(true)}
            className="w-full"
          >
            Move
          </PillButton>
        </div>

        {/* Danger Action: Delete */}
        <div className="pt-2 flex justify-end">
          <PillButton
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete File
          </PillButton>
        </div>
      </SlideUpModal>

      {/* Sub-modals */}
      <ShareModal
        isOpen={showShare}
        file={currentFile}
        onClose={() => setShowShare(false)}
      />

      <RenameModal
        isOpen={showRename}
        initialName={currentFile.name}
        title="Rename File"
        onRename={handleRename}
        onClose={() => setShowRename(false)}
      />

      <MoveModal
        isOpen={showMove}
        fileCount={1}
        currentFolderId={currentFile.folderId}
        onMove={handleMove}
        onClose={() => setShowMove(false)}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${currentFile.name}" from ${currentFile.provider.replace('-', ' ')}?`}
        confirmLabel="Delete File"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

