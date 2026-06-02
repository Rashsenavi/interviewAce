"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const success = useCallback((message: string, duration?: number) => addToast(message, "success", duration), [addToast]);
  const error = useCallback((message: string, duration?: number) => addToast(message, "error", duration), [addToast]);
  const info = useCallback((message: string, duration?: number) => addToast(message, "info", duration), [addToast]);
  const warning = useCallback((message: string, duration?: number) => addToast(message, "warning", duration), [addToast]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Intercept native browser alert calls and route them through the beautiful toast system
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalAlert = window.alert;
      window.alert = (message: string) => {
        // Simple logic to detect if the alert message sounds like an error
        const isError = /fail|error|wrong|unable|invalid|cannot/i.test(message);
        if (isError) {
          error(message);
        } else {
          info(message);
        }
      };
      
      return () => {
        window.alert = originalAlert;
      };
    }
  }, [error, info]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, info, warning, remove }}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Styled inline Keyframes to keep the toast component completely self-contained and highly premium
const toastKeyframes = `
  @keyframes toast-slide-in-right {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes toast-slide-in-bottom {
    from { transform: translateY(120%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-toast-in {
    animation: toast-slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @media (max-width: 768px) {
    .animate-toast-in {
      animation: toast-slide-in-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  }
`;

const ToastContainer: React.FC<{ toasts: Toast[]; remove: (id: string) => void }> = ({ toasts, remove }) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: toastKeyframes }} />
      <div className="fixed z-[99999] top-4 right-4 md:top-6 md:right-6 bottom-auto left-auto md:left-auto flex flex-col gap-3 w-full max-w-[380px] p-4 md:p-0 pointer-events-none max-h-screen overflow-y-auto max-md:top-auto max-md:bottom-4 max-md:left-1/2 max-md:transform max-md:-translate-x-1/2">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => remove(toast.id)} />
        ))}
      </div>
    </>
  );
};

const ToastCard: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const { type, message } = toast;

  // Icon mappings
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-emerald-500/20 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 shadow-[0_8px_30px_rgba(16,185,129,0.12)]";
      case "error":
        return "border-rose-500/20 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 shadow-[0_8px_30px_rgba(244,63,94,0.12)]";
      case "warning":
        return "border-amber-500/20 bg-amber-50/95 dark:bg-amber-950/90 text-amber-900 dark:text-amber-100 shadow-[0_8px_30px_rgba(245,158,11,0.12)]";
      case "info":
      default:
        return "border-indigo-500/20 bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-100 shadow-[0_8px_30px_rgba(99,102,241,0.12)]";
    }
  };

  return (
    <div className={`animate-toast-in pointer-events-auto flex items-start gap-3 w-full p-4 rounded-2xl border backdrop-blur-md transition-all ${getBorderColor()}`}>
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-grow text-sm font-medium leading-normal pr-2">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
