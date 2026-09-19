import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E7E5] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" />
          <span className="text-xs font-semibold text-[#8A8785]">Loading dockMore...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children ? children : <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E7E5] flex items-center justify-center font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
}
