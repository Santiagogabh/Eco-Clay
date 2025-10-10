import React from 'react';

export function Tabs({ value, onValueChange, defaultValue, children, className='' }) {
  const [internal, setInternal] = React.useState(defaultValue || value);
  const current = value !== undefined ? value : internal;
  const set = onValueChange || setInternal;
  return (
    <div className={className}>{
      React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, { tabsValue: current, setTabsValue: set });
      })
    }</div>
  );
}

export function TabsList({ children, className='' }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className='', tabsValue, setTabsValue }) {
  const active = tabsValue === value;
  return (
    <button
      type="button"
      data-state={active ? 'active' : 'inactive'}
      className={className}
      onClick={() => setTabsValue && setTabsValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className='', tabsValue }) {
  if (tabsValue !== value) return null;
  return <div className={className}>{children}</div>;
}
