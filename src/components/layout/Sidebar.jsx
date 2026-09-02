import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Folder,
  ArrowLeftRight,
  Settings,
  HelpCircle,
  Plus,
  Cloud,
  ChevronsUpDown,
  User,
  Sliders,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import NavItem from '../ui/NavItem';
import AccountRow from '../ui/AccountRow';
import { useAccounts } from '../../hooks/useAccounts';

export default function Sidebar({ onCloseMobile }) {
  const { accounts, user, loading } = useAccounts();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <aside className="sidebar-scroll w-[260px] lg:w-[290px] h-full bg-sidebar flex flex-col justify-between py-6 px-5 lg:px-7 shrink-0 overflow-y-auto md:overflow-y-hidden md:hover:overflow-y-auto select-none [scrollbar-gutter:stable]">
      {/* Top Section */}
      <div className="flex flex-col gap-5">
        {/* Logo */}
        <div className="px-1 pt-2 pb-3">
          <Logo />
        </div>

        {/* Primary Navigation: Home, All Files, Transfers */}
        <nav className="flex flex-col gap-1">
          <NavItem
            to="/"
            end
            icon={Home}
            label="Home"
            onClick={onCloseMobile}
          />
          <NavItem
            to="/files"
            icon={Folder}
            label="All Files"
            onClick={onCloseMobile}
          />
          <NavItem
            to="/transfers"
            icon={ArrowLeftRight}
            label="Transfers"
            onClick={onCloseMobile}
          />
        </nav>

        {/* Thin Divider */}
        <div className="border-t border-[#D9D8D6] my-0.5" />

        {/* Cloud Accounts Section Header */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <div className="flex items-center gap-2 text-[#919191]">
              <Cloud className="w-[15px] h-[15px] stroke-[2]" />
              <span className="text-[11px] font-bold tracking-wider uppercase font-sans">
                CLOUD ACCOUNTS
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate('/accounts');
                onCloseMobile && onCloseMobile();
              }}
            className="inline-flex items-center gap-1 bg-[#303030] hover:bg-black text-white text-[11px] font-medium px-2.5 py-1 rounded-figma transition-colors duration-150"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>ADD</span>
            </button>
          </div>

          {/* Connected Accounts List */}
          <div className="flex flex-col gap-3">
            {loading ? (
              <div className="px-2 py-2 text-xs text-muted">
                Loading accounts...
              </div>
            ) : (
              accounts.slice(0, 4).map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  onClick={() => {
                    navigate('/accounts');
                    onCloseMobile && onCloseMobile();
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Generous spacing using mt-auto */}
      <div className="flex flex-col gap-3 mt-auto pt-8">
        {/* Thin Divider */}
        <div className="border-t border-[#D9D8D6] mb-1" />

        {/* Settings & Help Nav Items */}
        <div className="flex flex-col gap-1">
          <NavItem
            to="/settings"
            icon={Settings}
            label="Settings"
            onClick={onCloseMobile}
          />

<button
            type="button"
            onClick={() => {
              alert('Help & Support center coming soon.');
            }}
            className="group flex items-center justify-start gap-3 px-4 py-3 rounded-xl font-semibold text-[15px] text-ink hover:bg-black/5 transition-colors duration-150 text-left select-none mx-1 w-[calc(100%-0.5rem)]"
          >
            <HelpCircle className="w-[18px] h-[18px] stroke-[2] shrink-0 text-ink" />
            <span className="truncate">Help & Support</span>
          </button>
        </div>

        {/* User Profile Card with Inline Glassmorphism Dropdown */}
        <div className="relative mt-1" ref={profileRef}>
          {/* Glassmorphism Popover Dropdown */}
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 backdrop-blur-md bg-white/70 border border-white/60 rounded-2xl shadow-lg z-50 flex flex-col gap-1 transition-all duration-150">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                  onCloseMobile && onCloseMobile();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink hover:bg-black/5 transition-colors duration-150 text-left"
              >
                <User className="w-3.5 h-3.5 text-muted" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                  onCloseMobile && onCloseMobile();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-ink hover:bg-black/5 transition-colors duration-150 text-left"
              >
                <Sliders className="w-3.5 h-3.5 text-muted" />
                <span>Preferences</span>
              </button>

              <div className="border-t border-black/5 my-0.5" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  alert('Signed out successfully');
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors duration-150 text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Profile Card Button */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="backdrop-blur-md bg-white/40 hover:bg-white/60 border border-white/50 rounded-2xl p-2.5 flex items-center justify-between transition-colors duration-150 cursor-pointer select-none"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'Shreyansh Singh'}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/80"
              />
              <div className="min-w-0 flex-1">
                <h5 className="text-sm font-bold text-ink truncate leading-tight">
                  {user?.name || 'Shreyansh Singh'}
                </h5>
                <p className="text-[10.5px] text-muted leading-tight mt-0.5">
                  {user?.email || 'mailshreyanshhere@gmail.com'}
                </p>
              </div>
            </div>

            <ChevronsUpDown className="w-4 h-4 text-muted shrink-0 ml-1" />
          </div>
        </div>
      </div>
    </aside>
  );
}
