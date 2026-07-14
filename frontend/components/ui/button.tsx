import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:opacity-90',
      destructive: 'bg-danger text-white hover:opacity-90',
      outline: 'border bg-background hover:bg-secondary',
      ghost: 'hover:bg-secondary',
    }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
