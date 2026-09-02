import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, Lock } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from '../ui/Logo';
import PillButton from '../ui/PillButton';
import { useAccounts } from '../../hooks/useAccounts';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isAuthenticated, signIn } = useAccounts();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-screen bg-sidebar flex items-center justify-center p-6 antialiased">
        <div className="bg-surface rounded-3xl p-8 sm:p-10 max-w-md w-full flex flex-col items-center text-center gap-6 shadow-2xl animate-fade-in border border-track/40">
          <Logo />
          <div className="w-16 h-16 rounded-2xl bg-track/40 flex items-center justify-center text-ink">
            <Lock className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div>
            <h2 className="font-sans font-bold text-2xl text-ink">
              Signed Out
            </h2>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              Your session has ended. Click below to sign back in and restore your unified multi-cloud dashboard.
            </p>
          </div>
          <PillButton
            variant="solid"
            size="md"
            icon={LogIn}
            onClick={() => signIn()}
            className="w-full"
          >
            Sign Back In
          </PillButton>
        </div>
      </div>
    );
  }

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
