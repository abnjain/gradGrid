import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
      info: 'bg-info/10 text-info',
      secondary: 'bg-secondary/10 text-secondary-foreground',
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'
