import React from 'react';

export function Badge({ children, className = '', variant = 'default', ...props }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium';
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700',
  };
  return (
    <span className={`${base} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </span>
  );
}
