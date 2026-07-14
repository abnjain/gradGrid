import React, { useState } from 'react'

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
}

export const Tabs = ({ children, defaultValue }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue || '')
  return (
    <div className="w-full" data-active-tab={activeTab} data-set-active-tab={setActiveTab as any}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              activeTab,
              setActiveTab,
            })
          : child
      )}
    </div>
  )
}

export const TabsList = ({ children, className = '', ...props }: any) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-lg bg-secondary/20 p-1 ${className}`} {...props}>
    {children}
  </div>
)

export const TabsTrigger = ({ value, children, activeTab, setActiveTab, ...props }: any) => (
  <button
    onClick={() => setActiveTab(value)}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value ? 'bg-background shadow-sm' : 'hover:bg-background/50'
    }`}
    {...props}
  >
    {children}
  </button>
)

export const TabsContent = ({ value, children, activeTab, ...props }: any) => (
  <div role="tabpanel" hidden={activeTab !== value} {...props}>
    {activeTab === value && children}
  </div>
)
