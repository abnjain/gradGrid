import React from 'react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-info/10 border-info/30 text-info',
      success: 'bg-success/10 border-success/30 text-success',
      warning: 'bg-warning/10 border-warning/30 text-warning',
      error: 'bg-danger/10 border-danger/30 text-danger',
    }

    return (
      <div
        ref={ref}
        className={`relative w-full rounded-lg border px-4 py-3 text-sm flex gap-3 items-start ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Alert.displayName = 'Alert'
