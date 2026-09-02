import React, { useState, useMemo } from 'react';
import {
  Upload,
  FolderPlus,
  SlidersHorizontal,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import FileRow from '../components/ui/FileRow';
import PillButton from '../components/ui/PillButton';
import SearchInput from '../components/ui/SearchInput';
import ProviderIcon from '../components/ui/ProviderIcon';
import { useFiles } from '../hooks/useFiles';

const PROVIDER_FILTERS = [
  { id: 'all', label: 'All Files' },
  { id: 'google-drive', label: 'Google Drive', icon: 'google-drive' },
  { id: 'onedrive', label: 'OneDrive', icon: 'onedrive' },
  { id: 'dropbox', label: 'Dropbox', icon: 'dropbox' },
  { id: 'mega', label: 'MEGA', icon: 'mega' },
];

export default function AllFiles() {
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('modified'); // 'name', 'size', 'modified'
  const { files, loading } = useFiles();

  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        const matchesProvider =
          selectedProvider === 'all' || file.provider === selectedProvider;
        const matchesSearch =
          !searchQuery ||
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.accountEmail.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesProvider && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'size') return (b.sizeBytes || 0) - (a.sizeBytes || 0);
        return 0; // default order
      });
  }, [files, selectedProvider, searchQuery, sortBy]);

  const handleFileAction = (action, file) => {
    if (action === 'download') {
      alert(`Downloading ${file.name} from ${file.provider.replace('-', ' ')}`);
    } else if (action === 'share') {
      alert(`Generating shareable link for ${file.name}`);
    } else {
      alert(`Actions for ${file.name}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl md:text-3xl text-ink">
            All Files
          </h1>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted mt-1 font-medium">
            <span>Root</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink">Multi-Cloud Storage</span>
            {selectedProvider !== 'all' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="capitalize">{selectedProvider.replace('-', ' ')}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PillButton
            variant="ghost"
            size="sm"
            icon={FolderPlus}
            onClick={() => alert('Create new folder')}
          >
            New Folder
          </PillButton>
          <PillButton
            variant="solid"
            size="sm"
            icon={Upload}
            onClick={() => alert('Upload files')}
          >
            Upload File
          </PillButton>
        </div>
      </div>

      {/* Filter Pill Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
        {PROVIDER_FILTERS.map((filter) => {
          const isActive = selectedProvider === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSelectedProvider(filter.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors duration-150 ${
                isActive
                  ? 'bg-ink text-white'
                  : 'bg-surface text-ink hover:bg-white'
              }`}
            >
              {filter.icon && (
                <ProviderIcon provider={filter.icon} size="xs" />
              )}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface/60 p-2 rounded-2xl">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Filter files by name or account..."
          className="flex-1"
          size="sm"
        />

        <div className="flex items-center gap-2 justify-end px-2">
          <span className="text-xs text-muted font-medium">
            {filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}
          </span>
          <div className="h-4 w-px bg-track" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-transparent text-ink focus:outline-none cursor-pointer"
          >
            <option value="modified">Sort by Recent</option>
            <option value="name">Sort by Name</option>
            <option value="size">Sort by Size</option>
          </select>
        </div>
      </div>

      {/* Files List Table */}
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-muted select-none">
          <span className="flex-1">Name & Location</span>
          <div className="flex items-center gap-6 shrink-0">
            <span className="hidden sm:inline-block w-28">Cloud</span>
            <span className="w-20 text-right">Size</span>
            <span className="hidden md:inline-block w-32 text-right">Modified</span>
            <span className="w-16 text-right">Actions</span>
          </div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="bg-surface rounded-2xl py-12 text-center text-sm text-muted">
            Loading cloud files...
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-surface rounded-2xl py-12 text-center flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-semibold text-ink">No files found</p>
            <p className="text-xs text-muted">
              Try adjusting your search query or provider filter.
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onAction={handleFileAction}
              onSelect={() => handleFileAction('preview', file)}
            />
          ))
        )}
      </div>
    </div>
  );
}
