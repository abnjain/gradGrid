import React from 'react'

export const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={`h-4 w-4 rounded border border-primary bg-background checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  )
)
Checkbox.displayName = 'Checkbox'
