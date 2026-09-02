import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchInput
 * Rendered as a soft light-gray rounded pill input (#E5E4E2 / bg-sidebar)
 * with search icon on left and clear button on right.
 */
export default function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search across all your clouds...',
  className = '',
  inputClassName = '',
  size = 'md',
}) {
  const sizeClasses = {
    sm: 'py-2 pl-9 pr-7 text-xs',
    md: 'py-2.5 pl-10 pr-9 text-sm',
    lg: 'py-3 pl-11 pr-10 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-3',
    md: 'w-4 h-4 left-3.5',
    lg: 'w-4 h-4 left-4',
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className={`absolute text-muted pointer-events-none ${
          iconSizes[size] || iconSizes.md
        }`}
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-figma bg-sidebar border border-transparent hover:border-track focus:border-ink/20 focus:bg-white text-ink placeholder:text-muted focus:outline-none transition-colors duration-150 ${
          sizeClasses[size] || sizeClasses.md
        } ${inputClassName}`}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors duration-150"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
