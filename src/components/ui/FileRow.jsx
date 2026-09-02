import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FileCode,
  FileArchive,
  Film,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  MoreVertical,
  Star,
  Download,
  Share2,
  Edit3,
  FolderInput,
  Trash2,
  Check,
} from 'lucide-react';
import ProviderIcon from './ProviderIcon';

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

/**
 * FileRow
 * Renders an individual file listing row in AllFiles.jsx
 */
export default function FileRow({
  file,
  isSelected = false,
  onToggleSelect,
  onSelect,
  onAction,
  className = '',
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  if (!file) return null;

  const {
    name,
    extension,
    size,
    provider,
    accountEmail,
    modified,
    path,
    starred = false,
  } = file;

  const FileTypeIcon = getFileIcon(extension);

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between py-3 px-4 rounded-xl transition-colors duration-150 cursor-pointer select-none ${
        isSelected
          ? 'bg-white ring-1 ring-ink/20 shadow-sm'
          : 'bg-surface hover:bg-white'
      } ${className}`}
    >
      {/* Left: Checkbox + Icon + Name + Location */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
        {/* Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect && onToggleSelect(file.id);
          }}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isSelected
              ? 'bg-ink border-ink text-white'
              : 'border-track hover:border-ink/50 bg-white group-hover:border-ink/40'
          }`}
          aria-label={isSelected ? 'Deselect file' : 'Select file'}
        >
          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </div>

        <div className="w-9 h-9 rounded-lg bg-track/40 flex items-center justify-center text-ink shrink-0">
          <FileTypeIcon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-ink truncate leading-tight">
              {name}
            </h5>
            {starred && (
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted truncate">
              {path || '/'}
            </span>
            <span className="text-muted text-[10px]">•</span>
            <span className="text-xs text-muted truncate">
              {accountEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right: Provider & Size & Modified */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Provider badge */}
        <div className="hidden sm:flex items-center gap-1.5 w-28">
          <ProviderIcon provider={provider} size="xs" />
          <span className="text-xs text-ink/80 font-medium capitalize truncate">
            {provider.replace('-', ' ')}
          </span>
        </div>

        {/* File Size */}
        <div className="w-20 text-right">
          <span className="text-xs font-medium text-ink">{size}</span>
        </div>

        {/* Modified Date */}
        <div className="hidden md:block w-32 text-right">
          <span className="text-xs text-muted">{modified}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 relative" ref={menuRef}>
          <button
            type="button"
            className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors duration-150"
            title="Download file"
            onClick={(e) => {
              e.stopPropagation();
              onAction && onAction('download', file);
            }}
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors duration-150"
            title="Share file"
            onClick={(e) => {
              e.stopPropagation();
              onAction && onAction('share', file);
            }}
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="p-1.5 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors duration-150"
            title="More actions"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* More Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 bg-white border border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.14)] rounded-2xl p-1.5 min-w-[150px] z-50 flex flex-col gap-1 text-ink animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onAction && onAction('preview', file);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 transition-colors text-left"
              >
                <FileText className="w-3.5 h-3.5 text-muted" />
                <span>View Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onAction && onAction('star', file);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 transition-colors text-left"
              >
                <Star className={`w-3.5 h-3.5 ${file.starred ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                <span>{file.starred ? 'Unstar' : 'Star'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onAction && onAction('rename', file);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 transition-colors text-left"
              >
                <Edit3 className="w-3.5 h-3.5 text-muted" />
                <span>Rename</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onAction && onAction('move', file);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 transition-colors text-left"
              >
                <FolderInput className="w-3.5 h-3.5 text-muted" />
                <span>Move</span>
              </button>

              <div className="border-t border-black/5 my-0.5" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onAction && onAction('delete', file);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
