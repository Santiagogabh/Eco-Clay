import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  React.useEffect(() => {
    function onKey(e){ if(e.key==='Escape') onOpenChange && onOpenChange(false); }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange && onOpenChange(false)} />
      <div className="relative z-10 bg-white rounded-2xl w-[90%] max-w-xl shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className='' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function DialogHeader({ children }) {
  return <div className="mb-2">{children}</div>;
}

export function DialogTitle({ children, className='' }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
