import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3200) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast, toast: showToast, dismissToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isError = t.type === 'error' || t.type === 'danger';
          const isSuccess = t.type === 'success';

          return (
            <div
              key={t.id}
              className="pointer-events-auto bg-ink text-white text-xs sm:text-sm font-medium px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] border border-white/10 flex items-center justify-between gap-3 animate-fade-in transition-all duration-150 select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {isError ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-white/80 shrink-0" />
                )}
                <span className="truncate leading-tight">{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
