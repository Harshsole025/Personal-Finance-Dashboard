import { createContext, useContext, useMemo, useState } from 'react';

type Toast = { id: string; message: string };

const ToastContext = createContext<{ add: (message: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const api = useMemo(() => ({
    add(message: string) {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
    },
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 inset-x-0 flex flex-col items-center gap-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto bg-zinc-900 text-white text-sm px-3 py-2 rounded shadow">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

