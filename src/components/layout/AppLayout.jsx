import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from '../ui/Logo';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen md:h-screen md:w-screen md:overflow-hidden bg-sidebar text-ink flex flex-col md:flex-row antialiased p-0">
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-track/60 sticky top-0 z-40">
        <Logo />
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-full hover:bg-black/5 text-ink transition-colors duration-150"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block h-screen shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity duration-150"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-[280px] h-full bg-sidebar shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area — fixed outer frame with internal scrolling */}
      <main className="flex-1 min-w-0 w-full bg-white md:mt-[27px] md:h-[calc(100vh-27px)] md:rounded-tl-figma overflow-y-auto">
        {isHome ? (
          <div className="px-4 pt-2 pb-4 md:px-8 md:pt-2 md:pb-8">
            <Outlet />
          </div>
        ) : (
          <div className="bg-surface rounded-figma p-6 md:p-8">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
}
