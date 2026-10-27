import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'saved') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return { toasts, showToast };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg shadow-lg"
        >
          <span className={`size-2 rounded-full ${toast.type === 'saving' ? 'animate-pulse bg-muted' : 'bg-accent'}`} />
          {toast.message}
        </div>
      ))}
    </div>
  );
}
