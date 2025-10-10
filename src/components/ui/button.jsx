import React from 'react';

export function Button({ children, className = '', variant = 'default', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6',
    icon: 'h-10 w-10'
  };
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800 rounded-md',
    outline: 'border border-gray-200 hover:bg-gray-50 rounded-md',
  };
  return (
    <button className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.default} ${className}`} {...props}>
      {children}
    </button>
  );
}
