import React from 'react';
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
  onSelect,
  onAction,
  className = '',
}) {
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
      className={`group flex items-center justify-between py-3.5 px-4 rounded-xl bg-surface hover:bg-white transition-colors duration-150 cursor-pointer ${className}`}
    >
      {/* Left: Icon, Name, and Path */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
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
        <div className="flex items-center gap-1">
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
              onAction && onAction('more', file);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
