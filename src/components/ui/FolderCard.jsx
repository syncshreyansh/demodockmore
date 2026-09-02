import React, { useState, useRef, useEffect } from 'react';
import { Folder, MoreVertical, FolderOpen, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RenameModal from './RenameModal';
import ConfirmModal from './ConfirmModal';
import { useFiles } from '../../hooks/useFiles';
import { useToast } from '../../context/ToastContext';

/**
 * FolderCard
 * Clean minimal folder card matching Figma reference.
 * - Top row: Folder outline icon on left, 3-dots kebab menu (MoreVertical) on right.
 * - Body: Bold uppercase folder title (e.g. "FOLDER 1").
 * - Accent card: Stacked black tab effect behind the front card.
 */
export default function FolderCard({ folder, onClick, className = '' }) {
  const navigate = useNavigate();
  const { renameFolder, deleteFolder } = useFiles();
  const { showToast } = useToast();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  if (!folder) return null;

  const { name = 'FOLDER', accent = false } = folder;

  const handleCardClick = () => {
    if (onClick) {
      onClick(folder);
    } else {
      navigate(`/files?folder=${folder.id}`);
    }
  };

  const handleRename = (newName) => {
    renameFolder(folder.id, newName);
    showToast(`Renamed folder to "${newName.toUpperCase()}"`, 'success');
  };

  const handleDelete = () => {
    deleteFolder(folder.id);
    setShowDeleteConfirm(false);
    showToast(`Deleted folder "${folder.name}"`, 'info');
  };

  return (
    <>
      <div className={`relative ${accent ? 'pt-4' : ''} ${className}`}>
        {/* Stacked Black Background Card / Tab Layer for Card 1 */}
        {accent && (
          <div
            className="absolute inset-x-3 top-0 h-11 bg-[#303030] rounded-figma z-0"
            aria-hidden="true"
          />
        )}

        {/* Front White Folder Card */}
        <div
          onClick={handleCardClick}
          className="relative z-10 bg-white rounded-figma p-5 cursor-pointer transition-colors duration-150 flex items-center justify-between min-h-[86px] hover:bg-white/95"
        >
          {/* Top row: Folder icon on left + Kebab menu on right */}
          <div className="flex items-center justify-between">
            <div className="text-ink">
              <Folder className="w-5 h-5 stroke-[1.75]" />
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                className="p-1 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                aria-label="Folder options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 bg-white border border-black/10 shadow-[0_4px_24px_rgba(0,0,0,0.14)] rounded-2xl p-1.5 min-w-[140px] z-50 flex flex-col gap-1 text-ink animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate(`/files?folder=${folder.id}`);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 transition-colors text-left"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-muted" />
                    <span>Open</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowRename(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-black/5 transition-colors text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-muted" />
                    <span>Rename</span>
                  </button>

                  <div className="border-t border-black/5 my-0.5" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
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

          {/* Body: Bold Folder Title */}
          <div className="ml-3 mr-auto min-w-0">
            <h4 className="font-sans font-bold text-sm text-ink tracking-tight uppercase truncate">
              {name}
            </h4>
          </div>
        </div>
      </div>

      <RenameModal
        isOpen={showRename}
        initialName={folder.name}
        title="Rename Folder"
        onRename={handleRename}
        onClose={() => setShowRename(false)}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Folder"
        message={`Are you sure you want to delete "${folder.name}"? Files inside will be moved to Root.`}
        confirmLabel="Delete Folder"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
