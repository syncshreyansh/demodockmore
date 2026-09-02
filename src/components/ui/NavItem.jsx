import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * NavItem
 * Active: solid #303030 pill with white text/icon.
 * Inactive: transparent background with #1A1A1A text/icon and subtle hover.
 */
export default function NavItem({
  to,
  icon: Icon,
  label,
  end = false,
  onClick,
  className = '',
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center justify-start px-4 py-3 rounded-figma font-semibold text-[15px] transition-colors duration-150 select-none mx-1 w-[calc(100%-0.5rem)] ${
          isActive
            ? 'bg-[#303030] text-white font-semibold shadow-none'
            : 'text-ink hover:bg-black/5'
        } ${className}`
      }
    >
      {({ isActive }) => (
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon
              className={`w-[18px] h-[18px] stroke-[2] shrink-0 transition-colors duration-150 ${
                isActive ? 'text-white' : 'text-ink'
              }`}
            />
          )}
          <span className="truncate">{label}</span>
        </div>
      )}
    </NavLink>
  );
}
