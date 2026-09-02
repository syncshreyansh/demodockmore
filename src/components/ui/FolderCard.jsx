import React from 'react';
import { Folder, MoreVertical } from 'lucide-react';

/**
 * FolderCard
 * Clean minimal folder card matching Figma reference.
 * - Top row: Folder outline icon on left, 3-dots kebab menu (MoreVertical) on right.
 * - Body: Bold uppercase folder title (e.g. "FOLDER 1").
 * - Accent card: Stacked black tab effect behind the front card.
 * - No item counts or updated timestamp footer lines.
 */
export default function FolderCard({ folder, onClick, className = '' }) {
  if (!folder) return null;

  const { name = 'FOLDER', accent = false } = folder;

  return (
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
        onClick={onClick}
        className="relative z-10 bg-white rounded-figma p-5 cursor-pointer transition-colors duration-150 flex items-center justify-between min-h-[86px] hover:bg-white/95"
      >
        {/* Top row: Folder icon on left + Kebab menu on right */}
        <div className="flex items-center justify-between">
          <div className="text-ink">
            <Folder className="w-5 h-5 stroke-[1.75]" />
          </div>

          <button
            type="button"
            className="p-1 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Folder options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Bold Folder Title */}
        <div className="ml-3 mr-auto">
          <h4 className="font-sans font-bold text-sm text-ink tracking-tight uppercase">
            {name}
          </h4>
        </div>
      </div>
    </div>
  );
}
