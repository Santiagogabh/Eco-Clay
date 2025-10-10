import React from 'react';

export function Card({ children, className='' }) {
  return <div className={`border border-gray-200 bg-white rounded-2xl ${className}`}>{children}</div>;
}

export function CardHeader({ children, className='' }) {
  return <div className={`p-4 border-b border-gray-100 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className='' }) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}

export function CardContent({ children, className='' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
